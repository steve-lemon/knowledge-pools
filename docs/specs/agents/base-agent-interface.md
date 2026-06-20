# Spec: Base Agent Interface

This spec defines the shared implementation-facing interface that every
Knowledge Pools agent must satisfy before stage-specific agent specs are written.

It refines the architecture-level
[Agent Superclass Contract](../../architecture/agent-superclass-contract.md)
into the narrower contract used by the current prototype runtime.

The execution snapshot boundary is recorded in
[Agent Execution Snapshot](../../decisions/2026-06-20-agent-execution-snapshot.md).

## Purpose

Provide one stable agent boundary for:

- task and context identity validation;
- tool port grant enforcement;
- stage-specific execution;
- typed artifact and optional handoff return;
- trace ref collection;
- typed failure normalization.

The goal is to let each stage agent focus on its own domain behavior while the
runtime keeps validation, traceability, and permission mechanics consistent.

## Scope

This spec applies to all implementation-facing agent specs under
`docs/specs/agents/`.

The current runtime code only implements the prototype subset used by
`SummaryAgent` and the sample `EvaluationAgent`. Full stage names, production
handoffs, durable run stores, and media-specific behavior remain specification
targets until their own checklist items are completed.

## Non-Goals

- No production workflow engine.
- No provider-specific model session state.
- No direct source, artifact, trace, index, or memory storage access from agents.
- No broad runtime implementation beyond prototype support.
- No stage-specific prompt, evidence, ranking, or curation policy.
- No hidden agent-to-agent message channel.

## Owned Responsibilities

`BaseAgent` owns:

- validating `task.stage` against `agent.stage`;
- validating `task.agentId` against `agent.agentId`;
- validating task/context identity alignment;
- validating required and forbidden tool grants before execution;
- invoking stage-specific `execute`;
- converting validation or execution failures into `AgentResult.status = "failed"`;
- collecting trace refs from `ToolPortRegistry`;
- returning a normalized `AgentResult`;
- emitting runtime log events for start, completion, and failure.

Stage-specific agents own:

- declaring `stage`, `agentId`, `outputSchemaRef`, and `tools`;
- defining typed task input, artifact payload, and optional handoff payload;
- implementing deterministic behavior before optional model behavior;
- calling only granted tool ports through `ToolPortRegistry`;
- validating and writing artifacts through declared ports;
- returning warnings as typed validation issues;
- documenting any partial-result or retry behavior in the agent spec.

The orchestrator owns:

- creating sessions, runs, tasks, and context envelopes;
- selecting agents;
- deciding stage transitions from validated handoffs;
- updating run/task indexes;
- stopping dispatch before execution when task/context/tool grants are invalid.

## Dependencies

- [Common Contracts And IDs](../contracts/common-contracts.md)
- [Runtime And Orchestrator Contracts](../modules/runtime-orchestrator.md)
- [Common Tool Port Contracts](../tools/common-tool-port-contracts.md)
- [Schema, Artifact, And Audit Tool Ports](../tools/schema-artifact-audit-tool-ports.md)
- [Agent Superclass Contract](../../architecture/agent-superclass-contract.md)

## Public Interfaces

The implementation target is a generic superclass:

```ts
export abstract class BaseAgent<TInput, TOutput, THandoff = never> {
  abstract readonly stage: StageName;
  abstract readonly agentId: AgentName;
  abstract readonly outputSchemaRef: RefString;
  abstract readonly tools: AgentToolset;

  run(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>>;
}
```

Stage agents implement only the stage-specific execution hook:

```ts
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
```

Rules:

- `run` is the only normal runtime entry point.
- `execute` must not be called directly by the orchestrator.
- `execute` must return `Result<T>` rather than throwing expected failures.
- unexpected exceptions may still fail the process in prototype code, but
  production runtime specs must normalize them before crossing the orchestrator
  boundary.

## TypeScript Types

Current prototype TypeScript APIs use `camelCase`:

```ts
export interface AgentTask<TInput = unknown> {
  taskId: string;
  runId: string;
  sessionId?: string;
  stage: StageName;
  agentId: AgentName;
  intent: string;
  input: TInput;
  contextRefs: RefString[];
  constraints: AgentConstraints;
  allowedToolPorts: string[];
  outputSchemaRef: RefString;
  createdAt: IsoDateTime;
}

export interface ContextEnvelope {
  contextId: string;
  runId: string;
  sessionId?: string;
  taskId: string;
  stage: StageName;
  agentId: AgentName;
  purpose: "task_context";
  artifactRefs: RefString[];
  sourceRefs: RefString[];
  evidenceRefs: RefString[];
  memoryRefs: RefString[];
  taxonomyRefs: RefString[];
  schemaRefs: RefString[];
  constraints: AgentConstraints;
  excludedContext: RefString[];
  createdAt: IsoDateTime;
}

export interface AgentResult<TOutput = unknown, THandoff = unknown> {
  taskId: string;
  runId: string;
  sessionId?: string;
  stage: StageName;
  agentId: AgentName;
  status: AgentStatus;
  artifact?: Artifact<TOutput>;
  handoff?: THandoff;
  executionSnapshot?: ExecutionSnapshot;
  traceRefs: RefString[];
  errors: AgentError[];
  warnings: ValidationIssue[];
}

export interface AgentToolset {
  required: string[];
  optional: string[];
  forbidden: string[];
}

export interface ExecutionSnapshot {
  snapshotId: string;
  schemaVersion: SchemaVersion;
  runId: string;
  taskId: string;
  sessionId?: string;
  stage: StageName;
  agentId: AgentName;
  startedAt: IsoDateTime;
  completedAt?: IsoDateTime;
  status: AgentStatus;
  inputRefs: RefString[];
  contextRefs: RefString[];
  artifactRefs: RefString[];
  handoffRefs: RefString[];
  traceRefs: RefString[];
  grantedToolPorts: string[];
  constraints: AgentConstraints;
  inspectionRefs: RefString[];
  usage?: ExecutionUsage;
}

export interface ExecutionUsage {
  estimatedCost?: EstimatedCost;
}

export interface EstimatedCost {
  amount: number;
  currency: string;
  estimated: true;
  source?: "model_usage" | "tool_usage" | "runtime_policy" | "unknown";
}
```

Persisted JSON contracts use `snake_case` and must be mapped at the storage or
serialization boundary. Agent implementations should not mix raw persisted JSON
fields into TypeScript runtime APIs.

## Classes Or Functions

`BaseAgent.run` sequence:

```text
record start time
  -> create abstract execution snapshot
  -> log agent.run.started
  -> validate task identity
  -> validate context identity
  -> validate required and forbidden tool grants
  -> execute stage-specific implementation
  -> attach snapshot refs, trace refs, and optional estimated cost
  -> on failure, return failed AgentResult
  -> on success, collect trace refs from registry
  -> return completed or completed_with_warnings AgentResult
  -> log terminal status
```

`ToolPortRegistry` interface:

```ts
export interface ToolPortRegistry {
  call<TRequest = unknown, TResponse = unknown>(
    portId: string,
    request: TRequest
  ): Promise<Result<TResponse>>;

  getTraceRefs(): string[];
}
```

Rules:

- agents must use `ports.call` for tool access;
- agents must not bypass the registry with direct storage or provider clients;
- registry-level permission checks are still required even after `BaseAgent`
  validates declared grants.

## Input Contracts

`AgentTask<TInput>` must include:

- stable task/run/session identity;
- the target `stage` and `agentId`;
- a small, schema-valid `input` payload;
- explicit `contextRefs`;
- explicit constraints;
- explicit `allowedToolPorts`;
- the expected `outputSchemaRef`.

`ContextEnvelope` must include:

- matching task/run/session identity;
- separated ref families for artifacts, sources, evidence, memory, taxonomy, and schemas;
- copied constraints;
- explicit excluded or unresolved context refs.

Rules:

- task input should carry intent and small parameters, not unbounded source text;
- context refs must be resolved by the orchestrator before dispatch;
- missing required context blocks dispatch unless the agent spec allows a partial result.

## Output Contracts

Successful agent results must include:

- matching task/run/session identity;
- agent `stage` and `agentId`;
- `status` of `completed` or `completed_with_warnings`;
- zero or one typed artifact;
- zero or one typed handoff;
- trace refs collected from the registry;
- zero errors;
- typed warnings.

Failed agent results must include:

- matching task/run/session identity;
- `status` of `failed`;
- no successful handoff;
- any trace refs collected before failure;
- at least one typed error.

`ExecutionSnapshot` is an abstract run snapshot, not a full execution dump.

It should preserve enough metadata to inspect one agent execution later:

- task, run, session, stage, and agent identity;
- start and completion timestamps;
- terminal status;
- input, context, artifact, handoff, and trace refs;
- granted tool ports;
- copied constraints;
- optional inspection refs;
- optional usage summary.

Detailed request payloads, response payloads, model provider details, token
breakdowns, and tool-specific diagnostics belong to concrete artifacts, trace
records, or implementation-specific inspection records referenced by the
snapshot.

`estimatedCost?` is intentionally optional and approximate. When present, it
must be traceable to model usage, tool usage, runtime policy, or an explicitly
unknown estimation source. The base contract does not define provider pricing
tables or billing reconciliation.

## Side Effects

Agents may cause side effects only by calling declared tool ports.

Allowed side effects are determined by the agent's toolset and the task's
granted ports. Typical side effects include schema validation traces, artifact
writes, and audit trace appends.

Agents must not:

- write files directly;
- mutate source manifests directly;
- write index projections directly;
- create durable memory directly;
- create curation decisions directly;
- store hidden provider session IDs as workflow state.

## Tool Ports

Every agent spec must declare:

- `required`: ports needed for normal execution;
- `optional`: ports the agent may use when granted by task constraints;
- `forbidden`: ports that must fail dispatch if granted.

Minimum common required ports for artifact-producing runtime agents:

- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Prototype agents may add prototype-specific ports such as `summary.read` or
`llm.summarize`. Production stage agents must use the stage-appropriate tool
ports defined under `docs/specs/tools/`.

## Validation Rules

`BaseAgent` must fail before `execute` when:

- `task.stage !== agent.stage`;
- `task.agentId !== agent.agentId`;
- `context.taskId !== task.taskId`;
- `context.runId !== task.runId`;
- any required port is missing from `task.allowedToolPorts`;
- any forbidden port is present in `task.allowedToolPorts`.

The orchestrator must additionally validate:

- task schema;
- context schema;
- output schema ref compatibility;
- optional port grant policy;
- handoff schema compatibility before creating the next task.

Stage-specific agents must validate:

- stage input semantics;
- artifact payload schema;
- handoff payload schema when present;
- evidence requirements;
- deterministic checks before model-assisted checks.

## Failure Modes

| Code | Owner | Behavior |
| --- | --- | --- |
| `invalid_stage` | `BaseAgent` | Return failed result before execution. |
| `invalid_agent` | `BaseAgent` | Return failed result before execution. |
| `context_mismatch` | `BaseAgent` | Return failed result before execution. |
| `tool_permission_denied` | `BaseAgent` or registry | Return failed result; no handoff. |
| `tool_failure` | Stage agent | Return failed result unless agent spec allows partial output. |
| `schema_validation_failure` | Stage agent or orchestrator | Block artifact write or handoff according to policy. |
| `invalid_handoff` | Orchestrator | Block next task creation. |
| `missing_context` | Orchestrator or stage agent | Block or fail according to retryability and partial-result policy. |
| `model_failure` | Stage agent | Retry only when policy and idempotency allow it. |

## Trace Events

The base runtime should emit or collect trace coverage for:

- agent run start;
- agent run validation failure;
- stage-specific tool calls;
- schema validation;
- artifact write;
- audit trace append;
- execution snapshot creation or update;
- optional estimated cost calculation;
- agent run completion or failure.

Prototype code may use logger events plus registry trace refs. Production
runtime specs should persist trace events through `audit.trace`.

Trace payloads must not include full source bytes, secrets, or hidden model
provider state.

Inspection records may contain compact request/response summaries, selected
metadata, usage details, or implementation diagnostics when a concrete runtime
adds them. They must be referenced from `ExecutionSnapshot.inspectionRefs` rather
than embedded into the base agent result.

## Fixtures

Base-agent validation fixtures should cover:

- valid prototype dispatch;
- invalid stage;
- invalid agent;
- context mismatch;
- missing required port;
- forbidden granted port;
- stage execution failure;
- completed result with warnings.

Fixtures may start with `SummaryAgent` and sample `EvaluationAgent` until the
P1 production agent specs are written.

## Acceptance Criteria

This spec is ready when:

- the shared `BaseAgent` lifecycle is explicit;
- task, context, artifact, handoff, trace, and tool responsibilities are separated;
- every agent result can point to an abstract execution snapshot;
- optional cost information is represented as `estimatedCost?` without locking
  provider-specific pricing details into the base contract;
- every future agent spec has a required place to declare required, optional, and forbidden ports;
- deterministic behavior is required before optional model behavior;
- current prototype code can be mapped to the spec without new runtime concepts;
- the spec clearly separates current prototype support from later production stages.

## Open Questions

- Should `BaseAgent.run` catch unexpected exceptions in the prototype runtime, or
  should exception normalization wait for the production orchestrator?
- Should optional tool grant validation live entirely in the orchestrator, or
  should `BaseAgent` also reject optional ports when task constraints do not
  mention them?
- Should handoff wrapping move into `BaseAgent`, or remain stage/orchestrator
  owned until the first full Markdown-first loop is implemented?
