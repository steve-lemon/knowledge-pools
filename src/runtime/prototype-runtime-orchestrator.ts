import { randomUUID } from "node:crypto";
import { err, ok } from "../contracts/common.js";
import type { Result } from "../contracts/common.js";
import type { BaseAgent } from "./base-agent.js";
import type {
  AgentResult,
  AgentTask,
  ContextEnvelope
} from "./agent-contracts.js";
import type { ToolPortRegistry } from "./tool-port-registry.js";

export interface CreatePrototypeTaskOptions {
  intent: string;
  sessionId?: string;
  contextRefs?: string[];
  constraints?: AgentTask["constraints"];
  allowedToolPorts?: string[];
}

export interface PrototypeDispatchResult<TOutput, THandoff> {
  task: AgentTask;
  context: ContextEnvelope;
  result: AgentResult<TOutput, THandoff>;
}

export class PrototypeRuntimeOrchestrator {
  createTask<TInput, TOutput, THandoff>(
    input: TInput,
    agent: BaseAgent<TInput, TOutput, THandoff>,
    options: CreatePrototypeTaskOptions
  ): AgentTask<TInput> {
    const allowedToolPorts =
      options.allowedToolPorts ?? [
        ...agent.tools.required,
        ...agent.tools.optional
      ];

    return {
      taskId: `task_${randomUUID()}`,
      runId: `run_${randomUUID()}`,
      sessionId: options.sessionId,
      stage: agent.stage,
      agentId: agent.agentId,
      intent: options.intent,
      input,
      contextRefs: options.contextRefs ?? [],
      constraints: options.constraints ?? {},
      allowedToolPorts,
      outputSchemaRef: agent.outputSchemaRef,
      createdAt: new Date().toISOString()
    };
  }

  createContext<TInput>(task: AgentTask<TInput>): ContextEnvelope {
    return {
      contextId: `context_${randomUUID()}`,
      runId: task.runId,
      sessionId: task.sessionId,
      taskId: task.taskId,
      stage: task.stage,
      agentId: task.agentId,
      purpose: "task_context",
      artifactRefs: [],
      sourceRefs: [],
      evidenceRefs: [],
      memoryRefs: [],
      taxonomyRefs: [],
      schemaRefs: [task.outputSchemaRef],
      constraints: task.constraints,
      excludedContext: [],
      createdAt: new Date().toISOString()
    };
  }

  async dispatch<TInput, TOutput, THandoff>(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    agent: BaseAgent<TInput, TOutput, THandoff>,
    ports: ToolPortRegistry
  ): Promise<Result<PrototypeDispatchResult<TOutput, THandoff>>> {
    const validation = this.validateDispatch(task, context, agent);

    if (!validation.ok) {
      return validation;
    }

    const result = await agent.run(task, context, ports);
    return ok({ task, context, result });
  }

  validateDispatch<TInput, TOutput, THandoff>(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    agent: BaseAgent<TInput, TOutput, THandoff>
  ): Result<void> {
    if (task.stage !== agent.stage) {
      return err(
        "invalid_stage",
        `Task stage ${task.stage} does not match agent stage ${agent.stage}.`
      );
    }

    if (task.agentId !== agent.agentId) {
      return err(
        "invalid_agent",
        `Task agent ${task.agentId} does not match ${agent.agentId}.`
      );
    }

    if (task.outputSchemaRef !== agent.outputSchemaRef) {
      return err(
        "schema_mismatch",
        "Task output schema does not match agent output schema."
      );
    }

    if (context.taskId !== task.taskId || context.runId !== task.runId) {
      return err("context_mismatch", "Context does not match task identity.");
    }

    for (const portId of agent.tools.required) {
      if (!task.allowedToolPorts.includes(portId)) {
        return err(
          "tool_permission_denied",
          `Required tool port is not granted: ${portId}.`
        );
      }
    }

    for (const portId of agent.tools.forbidden) {
      if (task.allowedToolPorts.includes(portId)) {
        return err(
          "tool_permission_denied",
          `Forbidden tool port was granted: ${portId}.`
        );
      }
    }

    return ok(undefined);
  }
}
