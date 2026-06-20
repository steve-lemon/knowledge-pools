import type { Result } from "../contracts/common.js";
import { err, ok } from "../contracts/common.js";
import type {
  AgentName,
  AgentResult,
  AgentTask,
  AgentToolset,
  ContextEnvelope,
  StageName
} from "./agent-contracts.js";
import type { ToolPortRegistry } from "./tool-port-registry.js";

export abstract class BaseAgent<TInput, TOutput, THandoff = never> {
  abstract readonly stage: StageName;
  abstract readonly agentId: AgentName;
  abstract readonly outputSchemaRef: string;
  abstract readonly tools: AgentToolset;

  async run(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>> {
    const validation = this.validateRun(task, context);

    if (!validation.ok) {
      return this.failedResult(task, validation.error);
    }

    const execution = await this.execute(task, context, ports);

    if (!execution.ok) {
      return this.failedResult(task, execution.error, ports.getTraceRefs());
    }

    return {
      taskId: task.taskId,
      runId: task.runId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      status:
        execution.value.warnings.length > 0
          ? "completed_with_warnings"
          : "completed",
      artifact: execution.value.artifact,
      handoff: execution.value.handoff,
      traceRefs: ports.getTraceRefs(),
      errors: [],
      warnings: execution.value.warnings
    };
  }

  protected abstract execute(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<
    Result<{
      artifact: AgentResult<TOutput, THandoff>["artifact"];
      handoff?: THandoff;
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
    traceRefs: string[] = []
  ): AgentResult<TOutput, THandoff> {
    return {
      taskId: task.taskId,
      runId: task.runId,
      sessionId: task.sessionId,
      stage: this.stage,
      agentId: this.agentId,
      status: "failed",
      traceRefs,
      errors: [error],
      warnings: []
    };
  }
}
