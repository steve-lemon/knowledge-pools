import { performance } from "node:perf_hooks";
import type { Result } from "../contracts/common.js";
import { err, ok } from "../contracts/common.js";
import type {
  AgentName,
  AgentResult,
  AgentTask,
  AgentToolset,
  ContextEnvelope,
  ExecutionUsage,
  StageName
} from "./agent-contracts.js";
import type { Logger } from "./logger.js";
import { noopLogger } from "./logger.js";
import type { ToolPortRegistry } from "./tool-port-registry.js";

export abstract class BaseAgent<TInput, TOutput, THandoff = never> {
  abstract readonly stage: StageName;
  abstract readonly agentId: AgentName;
  abstract readonly outputSchemaRef: string;
  abstract readonly tools: AgentToolset;

  constructor(protected readonly logger: Logger = noopLogger) {}

  async run(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>> {
    const startedAt = performance.now();
    const startedAtIso = new Date().toISOString();

    this.logger.info("agent.run.started", "Agent run started.", {
      taskId: task.taskId,
      runId: task.runId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      allowedToolPortCount: task.allowedToolPorts.length
    });

    const validation = this.validateRun(task, context);

    if (!validation.ok) {
      const result = this.failedResult(task, validation.error, [], startedAtIso);
      this.logger.error("agent.run.failed", "Agent run validation failed.", {
        taskId: task.taskId,
        runId: task.runId,
        stage: this.stage,
        agentId: this.agentId,
        status: result.status,
        errorCode: validation.error.code,
        durationMs: elapsedMs(startedAt),
        traceCount: result.traceRefs.length
      });
      return result;
    }

    const execution = await this.execute(task, context, ports);

    if (!execution.ok) {
      const result = this.failedResult(
        task,
        execution.error,
        ports.getTraceRefs(),
        startedAtIso
      );
      this.logger.error("agent.run.failed", "Agent run execution failed.", {
        taskId: task.taskId,
        runId: task.runId,
        stage: this.stage,
        agentId: this.agentId,
        status: result.status,
        errorCode: execution.error.code,
        durationMs: elapsedMs(startedAt),
        traceCount: result.traceRefs.length
      });
      return result;
    }

    const traceRefs = ports.getTraceRefs();
    const status =
      execution.value.warnings.length > 0
        ? "completed_with_warnings"
        : "completed";
    const result: AgentResult<TOutput, THandoff> = {
      taskId: task.taskId,
      runId: task.runId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      status,
      artifact: execution.value.artifact,
      handoff: execution.value.handoff,
      executionSnapshot: this.createExecutionSnapshot(
        task,
        status,
        startedAtIso,
        traceRefs,
        execution.value.artifact?.meta.id
          ? [`artifact:${execution.value.artifact.meta.id}`]
          : [],
        execution.value.inspectionRefs ?? [],
        execution.value.usage
      ),
      traceRefs,
      errors: [],
      warnings: execution.value.warnings
    };

    this.logger.info("agent.run.completed", "Agent run completed.", {
      taskId: result.taskId,
      runId: result.runId,
      sessionId: result.sessionId,
      stage: result.stage,
      agentId: result.agentId,
      status: result.status,
      artifactId: result.artifact?.meta.id,
      durationMs: elapsedMs(startedAt),
      traceCount: result.traceRefs.length,
      warningCount: result.warnings.length
    });

    return result;
  }

  protected abstract execute(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<
    Result<{
      artifact: AgentResult<TOutput, THandoff>["artifact"];
      handoff?: THandoff;
      inspectionRefs?: string[];
      usage?: ExecutionUsage;
      warnings: AgentResult<TOutput, THandoff>["warnings"];
    }>
  >;

  private validateRun(
    task: AgentTask<TInput>,
    context: ContextEnvelope
  ): Result<void> {
    if (task.stage !== this.stage) {
      return err(
        "invalid_stage",
        `Expected stage ${this.stage}, received ${task.stage}.`
      );
    }

    if (task.agentId !== this.agentId) {
      return err(
        "invalid_agent",
        `Expected agent ${this.agentId}, received ${task.agentId}.`
      );
    }

    if (context.taskId !== task.taskId || context.runId !== task.runId) {
      return err("context_mismatch", "Context does not match task identity.");
    }

    for (const portId of this.tools.required) {
      if (!task.allowedToolPorts.includes(portId)) {
        return err(
          "tool_permission_denied",
          `Required tool port is not granted: ${portId}.`
        );
      }
    }

    for (const portId of this.tools.forbidden) {
      if (task.allowedToolPorts.includes(portId)) {
        return err(
          "tool_permission_denied",
          `Forbidden tool port was granted: ${portId}.`
        );
      }
    }

    return ok(undefined);
  }

  private failedResult(
    task: AgentTask<TInput>,
    error: AgentResult<TOutput, THandoff>["errors"][number],
    traceRefs: string[] = [],
    startedAtIso = new Date().toISOString()
  ): AgentResult<TOutput, THandoff> {
    return {
      taskId: task.taskId,
      runId: task.runId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      status: "failed",
      executionSnapshot: this.createExecutionSnapshot(
        task,
        "failed",
        startedAtIso,
        traceRefs
      ),
      traceRefs,
      errors: [error],
      warnings: []
    };
  }

  private createExecutionSnapshot(
    task: AgentTask<TInput>,
    status: AgentResult<TOutput, THandoff>["status"],
    startedAt: string,
    traceRefs: string[],
    artifactRefs: string[] = [],
    inspectionRefs: string[] = [],
    usage?: ExecutionUsage
  ): AgentResult<TOutput, THandoff>["executionSnapshot"] {
    return {
      snapshotId: `snapshot_${task.taskId}`,
      schemaVersion: "execution_snapshot/v1",
      runId: task.runId,
      taskId: task.taskId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      startedAt,
      completedAt: new Date().toISOString(),
      status,
      inputRefs: task.contextRefs,
      contextRefs: task.contextRefs,
      artifactRefs,
      handoffRefs: [],
      traceRefs,
      grantedToolPorts: task.allowedToolPorts,
      constraints: task.constraints,
      inspectionRefs,
      usage
    };
  }
}

function elapsedMs(startedAt: number): number {
  return Math.round((performance.now() - startedAt) * 1000) / 1000;
}
