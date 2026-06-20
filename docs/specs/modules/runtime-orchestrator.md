# Spec: Runtime And Orchestrator Contracts

This spec defines the P1 runtime and orchestrator boundary for Markdown-first
validation.

It is a specification, not a broad runtime implementation request.

## Purpose

Define implementation-facing contracts for:

- runtime module responsibilities;
- orchestrator entry points;
- session creation and lookup;
- run creation, status, and replay;
- task creation and dispatch;
- context envelope assembly;
- tool grant enforcement;
- artifact write and validation sequence;
- handoff creation and validation sequence;
- trace creation;
- retry and partial-result policy;
- failure propagation.

## Scope

The runtime coordinates agents, tool ports, stores, artifacts, handoffs, and
traces.

The orchestrator owns workflow state and stage transitions.

The first implementation target remains Markdown/text with local JSON storage and
the existing `SummaryAgent` prototype as the only runtime sample code.

## Non-Goals

- No production orchestrator implementation.
- No distributed queue.
- No long-running worker pool.
- No external workflow engine.
- No production ACL engine.
- No broad runtime code beyond `SummaryAgent` prototype support.
- No durable memory writes before curation.
- No media-specific orchestration.

## Dependencies

This spec depends on:

- [Stage Data Flow Contract](../../architecture/stage-data-flow-contract.md);
- [Agent Superclass Contract](../../architecture/agent-superclass-contract.md);
- [Common Contracts And IDs](../contracts/common-contracts.md);
- [Local Store Layout](../stores/local-store-layout.md);
- [Common Tool Port Contracts](../tools/common-tool-port-contracts.md);
- [Schema, Artifact, And Audit Tool Ports](../tools/schema-artifact-audit-tool-ports.md).

## Core Flow

Runtime and orchestrator objects move through this sequence:

```text
Session
  -> Run
    -> Task
      -> ContextEnvelope
      -> Agent through BaseAgent
      -> Artifact
      -> HandoffEnvelope
      -> next Task
```

Rules:

- agents do not pass hidden conversation state to each other;
- every stage transition passes refs, schemas, validation status, provenance, and traceability;
- context is a bounded view for one task;
- handoff is a typed transition contract;
- artifacts are typed stage outputs;
- traces are append-only audit records.

## Runtime Module Responsibilities

The runtime module owns common execution mechanics:

- validate task shape;
- validate context envelope shape;
- enforce tool grants before execution;
- call the stage agent through `BaseAgent`;
- collect tool trace refs;
- validate produced artifacts;
- write artifacts through `artifact.write`;
- create and validate handoffs when needed;
- append trace events through `audit.trace`;
- normalize expected failures into typed results.

The runtime module must not:

- decide stage semantics;
- interpret source evidence;
- mutate durable memory;
- bypass tool ports for storage or provider access;
- repair invalid artifacts silently;
- rely on hidden provider session state.

## Orchestrator Responsibilities

The orchestrator owns workflow state:

- create or locate sessions;
- create runs;
- create tasks;
- assemble context envelopes;
- choose the next stage from validated handoffs;
- update run, task, and handoff indexes;
- expose replay inputs for validation harnesses;
- stop transitions when validation fails.

The orchestrator must not:

- inspect source content as evidence;
- generate model outputs directly;
- accept handoffs with failed validation;
- treat previews as source truth;
- create durable knowledge records before curation.

## Public Entry Points

```ts
export interface RuntimeOrchestrator {
  createSession(input: CreateSessionInput): Promise<Result<SessionView>>;
  createRun(input: CreateRunInput): Promise<Result<RunView>>;
  createTask<TInput = unknown>(
    input: CreateTaskInput<TInput>
  ): Promise<Result<TaskView<TInput>>>;
  dispatchTask<TInput = unknown, TOutput = unknown, THandoff = unknown>(
    input: DispatchTaskInput<TInput>
  ): Promise<Result<DispatchTaskOutput<TOutput, THandoff>>>;
  replayRun(input: ReplayRunInput): Promise<Result<ReplayRunOutput>>;
}
```

Rules:

- the orchestrator may expose narrower CLI-specific entry points later;
- entry points return typed `Result<T>` values;
- expected failures do not cross the boundary as unstructured exceptions.

## Session Creation And Lookup

```ts
export interface CreateSessionInput {
  repositoryId: RepositoryId;
  sessionId?: SessionId;
  purpose: string;
  initialRefs?: RefString[];
  createdAt: IsoDateTime;
}

export interface SessionView {
  repositoryId: RepositoryId;
  sessionId: SessionId;
  purpose: string;
  runRefs: RefString[];
  summaryRefs: RefString[];
  memoryRefs: RefString[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
```

Rules:

- sessions preserve continuity, not raw stage payloads;
- sessions may point to summaries, runs, open questions, and durable memory refs;
- sessions must not contain hidden provider thread IDs as source of truth;
- session lookup returns refs and metadata, not unbounded context.

## Run Creation, Status, And Replay

```ts
export type RunStatus =
  | "created"
  | "running"
  | "completed"
  | "completedWithWarnings"
  | "blocked"
  | "failed";

export interface CreateRunInput {
  repositoryId: RepositoryId;
  sessionId?: SessionId;
  intent: string;
  initialRefs: RefString[];
  createdAt: IsoDateTime;
}

export interface RunView {
  repositoryId: RepositoryId;
  runId: RunId;
  sessionId?: SessionId;
  intent: string;
  status: RunStatus;
  taskRefs: RefString[];
  artifactRefs: RefString[];
  handoffRefs: RefString[];
  traceRefs: RefString[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
```

Rules:

- one run is one workflow execution;
- runs are audit containers, not durable truth decisions;
- run replay reads persisted tasks, contexts, artifacts, handoffs, and traces;
- replay validates deterministic refs and statuses but does not rerun provider calls by default.

## Task Creation And Dispatch

```ts
export interface CreateTaskInput<TInput = unknown> {
  repositoryId: RepositoryId;
  runId: RunId;
  sessionId?: SessionId;
  stage: StageName;
  agentId: AgentName;
  intent: string;
  input: TInput;
  contextRefs: RefString[];
  constraints: AgentConstraints;
  allowedToolPorts: ToolPortId[];
  outputSchemaRef: RefString;
  expectedHandoffSchemaRef?: RefString;
  createdAt: IsoDateTime;
}

export interface TaskView<TInput = unknown> extends CreateTaskInput<TInput> {
  taskId: TaskId;
  status: "created" | "running" | "completed" | "blocked" | "failed";
}

export interface DispatchTaskInput<TInput = unknown> {
  taskRef: RefString;
  agent: BaseAgentLike<TInput>;
}

export interface BaseAgentLike<TInput = unknown> {
  stage: StageName;
  agentId: AgentName;
  outputSchemaRef: RefString;
  tools: AgentToolsetView;
}

export interface AgentToolsetView {
  required: ToolPortId[];
  optional: ToolPortId[];
  forbidden: ToolPortId[];
}
```

Rules:

- task input must be small enough to validate before the agent starts;
- task context refs must be explicit;
- task output schema ref must match the dispatched agent output schema;
- dispatch must fail before execution when required tool grants are missing.

## Context Envelope Assembly

Context envelope assembly resolves task context refs into a bounded package.

Rules:

- include only refs needed for the task;
- include source refs, artifact refs, evidence refs, memory refs, taxonomy refs, and schema refs separately;
- include constraints and excluded context;
- do not include unbounded raw source text;
- do not include hidden provider state;
- every included ref must be resolvable or explicitly listed as excluded/unresolved.

Failure behavior:

- unresolved required refs block task dispatch;
- optional unresolved refs become warnings only when the agent spec allows partial context;
- context/task identity mismatch fails before agent execution.

## Tool Grant Enforcement

Tool grants are enforced in two places:

1. runtime validates task grants against the agent toolset;
2. tool registry rejects calls to ports not granted for the task.

Rules:

- all required ports must be granted;
- forbidden ports must not be granted;
- optional ports may be granted only when the task constraints allow them;
- side effects stronger than the grant must fail with `toolPermissionDenied`;
- runtime must not bypass the registry for agent tool calls.

## Artifact Write And Validation Sequence

Artifact sequence:

```text
agent output
  -> schema.validate
  -> attach validation summary
  -> artifact.write
  -> audit.trace
  -> add artifact ref to run/task indexes
```

Rules:

- failed validation blocks normal artifact write when policy requires passed validation;
- failed artifacts may be written only for inspection with explicit failure status;
- artifacts must include metadata, payload, provenance, and validation;
- artifact refs must be resolvable by `artifact.read`;
- artifact payloads should reference source-sized content instead of embedding it.

## Handoff Creation And Validation Sequence

Handoff sequence:

```text
artifact refs + next-stage payload
  -> schema.validate
  -> handoff write
  -> audit.trace
  -> next task creation
```

Rules:

- handoffs are created only after required artifacts are valid;
- failed handoff validation blocks stage transition;
- handoffs include producer artifact refs and required next-stage input refs;
- handoffs must not duplicate long artifact payloads or source text;
- handoff refs are added to the run index.

## Trace Creation Rules

Runtime trace events should be emitted for:

- session creation;
- run creation and status changes;
- task creation and dispatch;
- context assembly;
- agent run start/completion/failure;
- tool calls;
- schema validation;
- artifact writes;
- handoff validation;
- stage transition decisions.

Rules:

- traces are append-only;
- traces reference artifacts, handoffs, tasks, tools, and source refs;
- traces do not replace artifacts;
- trace payloads must not contain full source bytes, provider secrets, or hidden provider session state.

## Retry And Partial-Result Policy

```ts
export interface RetryPolicy {
  maxAttempts: number;
  retryableErrorCodes: string[];
  backoffMs?: number;
}

export interface PartialResultPolicy {
  allowPartialResult: boolean;
  requiredArtifactRefs: RefString[];
  requiredValidationStatus: ValidationStatus[];
}
```

Rules:

- retries are allowed only for retryable errors;
- retry attempts must append traces;
- non-idempotent write operations must not be retried unless the write policy is idempotent;
- partial results may continue only when the task constraints and agent spec allow them;
- handoffs from partial results must declare missing refs and warnings.

## Failure Propagation

Failures propagate as typed run/task/agent status changes.

Rules:

- task validation failure becomes task `failed`;
- context assembly failure becomes task `blocked` or `failed` depending on retryability;
- tool permission failure becomes agent `failed` unless the agent can emit a review request;
- schema validation failure blocks handoff;
- artifact write failure fails the task unless inspection artifact policy allows recovery;
- handoff validation failure blocks next task creation;
- unrecoverable stage failure marks the run `failed`;
- recoverable missing context may mark the run `blocked`.

## Prototype Compatibility

The existing `SummaryAgent` prototype covers a narrow subset:

- `BaseAgent.run()` validates task identity, context identity, and tool grants;
- `InMemoryToolPortRegistry` enforces allowed ports;
- prototype ports may keep in-memory schema validation, artifact write, and audit trace behavior;
- `SummaryAgent` may emit a summary artifact without full orchestrator persistence.

This prototype compatibility does not imply broad runtime implementation scope.

## Open Questions

- Should handoffs receive dedicated `handoff.read` and `handoff.write` ports, or stay orchestrator-owned for the first Markdown-first loop?
- Should replay compare trace order strictly, or validate only required trace coverage?
- Should run status transitions be persisted by a dedicated store module before the first full runtime prototype?

## Acceptance Criteria

This spec is ready when:

- runtime and orchestrator responsibilities are separated;
- session, run, task, context, artifact, handoff, and trace ownership is explicit;
- context assembly rules prevent hidden source or provider state;
- tool grant enforcement is defined;
- artifact validation/write sequence is defined;
- handoff validation and transition blocking are defined;
- trace creation rules are defined;
- retry, partial result, and failure propagation policies are defined;
- `SummaryAgent` prototype compatibility remains narrow and explicit.
