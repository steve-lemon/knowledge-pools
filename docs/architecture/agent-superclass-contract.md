# Agent Superclass Contract

This document defines the common superclass contract for all Knowledge Pools agents.

Detailed behavior still belongs to each agent spec. The superclass defines only the shared runtime shape, validation lifecycle, trace requirements, and typed handoff envelope.

## Purpose

Every agent should be replaceable if it satisfies the same contract.

The system should not depend on:

- hidden LLM chat history;
- provider-specific thread IDs;
- agent-specific side effects;
- untyped handoff data;
- raw source content passed between agents.

Instead, every agent receives a typed task and bounded context, uses approved tool ports, emits typed artifacts, and optionally creates a typed handoff for the next stage.

## Layering

```text
BaseAgent<TInput, TOutput, THandoff>
  -> stage-specific agent implementation
  -> stage-specific artifact schema
  -> optional handoff envelope for the next stage
```

Common layer:

- task identity;
- run and session identity;
- stage and agent identity;
- context refs;
- tool port grants;
- constraints;
- trace refs;
- validation status;
- error shape;
- handoff envelope.

Stage-specific layer:

- input payload;
- output artifact payload;
- evidence semantics;
- candidate shape;
- next-stage handoff payload;
- quality metrics;
- stage-local validation rules.

## Superclass Lifecycle

All agents follow the same lifecycle:

```text
validate task
  -> load context envelope
  -> validate tool grants
  -> run stage-specific implementation
  -> validate output schema
  -> write artifact
  -> create handoff when needed
  -> emit traces
```

The lifecycle belongs to the orchestrator and base runtime. The stage agent owns only the implementation inside `run()`.

## Common Responsibilities

The base agent runtime must:

- validate task schema before execution;
- validate that the agent is allowed to use the requested tool ports;
- load only declared context refs;
- pass a bounded context envelope to the agent;
- collect trace events;
- validate output artifacts before handoff;
- block handoff when validation fails;
- return typed errors instead of freeform failure text.

The base agent runtime must not:

- interpret source evidence;
- decide durable memory writes;
- silently repair invalid artifacts;
- rely on provider-specific model sessions;
- mutate global state outside declared tool ports.

## Stage-Specific Responsibilities

Each agent spec must define:

- its stage name;
- its agent name;
- accepted task input type;
- produced artifact type;
- optional next handoff type;
- required, optional, and forbidden tool ports;
- stage-specific validation rules;
- quality metrics;
- retry behavior;
- failure classes.

## TypeScript Reference Types

These types are the v1 implementation target. They are intentionally plain TypeScript so they can later be paired with JSON Schema or a runtime validator such as Zod.

```ts
export type StageName =
  | "ingest"
  | "understand"
  | "connect"
  | "plan"
  | "retrieve"
  | "reason"
  | "verify"
  | "update"
  | "curation"
  | "evaluate";

export type AgentName =
  | "ingestion_agent"
  | "understanding_agent"
  | "connection_agent"
  | "retrieval_planner"
  | "retrieval_agent"
  | "reasoning_agent"
  | "verifier_agent"
  | "knowledge_update_agent"
  | "curation_agent"
  | "evaluation_agent";

export type ArtifactType =
  | "ingest_artifact"
  | "understanding_artifact"
  | "connection_artifact"
  | "retrieval_plan"
  | "evidence_bundle"
  | "draft_answer"
  | "proposed_action"
  | "verification_report"
  | "update_candidate"
  | "curation_decision"
  | "evaluation_report"
  | "handoff";

export type AgentStatus =
  | "completed"
  | "completed_with_warnings"
  | "blocked"
  | "failed";

export type ValidationStatus =
  | "passed"
  | "passed_with_warnings"
  | "failed"
  | "not_run";

export type AgentErrorCode =
  | "invalid_input"
  | "missing_context"
  | "tool_permission_denied"
  | "tool_failure"
  | "model_failure"
  | "schema_validation_failure"
  | "invalid_handoff"
  | "unresolved_ref"
  | "insufficient_evidence"
  | "conflict_detected"
  | "permission_required";

export type RefString = string;
export type IsoDateTime = string;

export interface AgentTask<TInput = unknown> {
  task_id: string;
  run_id: string;
  session_id?: string;
  stage: StageName;
  agent_id: AgentName;
  intent: string;
  input: TInput;
  context_refs: RefString[];
  constraints: AgentConstraints;
  allowed_tool_ports: string[];
  output_schema_ref: RefString;
  created_at: IsoDateTime;
}

export interface AgentConstraints {
  require_evidence_refs?: boolean;
  allow_model?: boolean;
  allow_partial_result?: boolean;
  freshness?: "latest" | "stable" | "historical" | "any";
  max_tool_calls?: number;
  max_candidates?: number;
  preferred_precision?: "high" | "balanced" | "high_recall";
  [key: string]: unknown;
}

export interface ContextEnvelope {
  context_id: string;
  run_id: string;
  session_id?: string;
  task_id: string;
  stage: StageName;
  agent_id: AgentName;
  artifact_refs: RefString[];
  source_refs: RefString[];
  evidence_refs: RefString[];
  memory_refs: RefString[];
  taxonomy_refs: RefString[];
  schema_refs: RefString[];
  constraints: AgentConstraints;
  created_at: IsoDateTime;
}

export interface ArtifactMeta {
  id: string;
  type: ArtifactType;
  schema_version: string;
  created_at: IsoDateTime;
  created_by: AgentName;
  run_id: string;
  session_id?: string;
  task_id: string;
  provenance: Provenance;
  validation: ValidationSummary;
}

export interface Artifact<TPayload = unknown> {
  meta: ArtifactMeta;
  payload: TPayload;
}

export interface Provenance {
  source_refs: RefString[];
  evidence_refs: RefString[];
  artifact_refs: RefString[];
  trace_refs: RefString[];
  generator?: GeneratorRef;
}

export interface GeneratorRef {
  kind: "deterministic" | "model" | "human" | "hybrid";
  name: string;
  version?: string;
  adapter_ref?: RefString;
}

export interface ValidationSummary {
  status: ValidationStatus;
  schema_ref: RefString;
  checked_at?: IsoDateTime;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
  ref?: RefString;
}

export interface TraceEvent {
  trace_id: string;
  run_id: string;
  task_id: string;
  stage: StageName;
  agent_id: AgentName;
  event_type: string;
  message?: string;
  refs: RefString[];
  created_at: IsoDateTime;
}

export interface AgentError {
  code: AgentErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface AgentResult<TOutput = unknown, THandoff = unknown> {
  task_id: string;
  run_id: string;
  session_id?: string;
  stage: StageName;
  agent_id: AgentName;
  status: AgentStatus;
  artifact: Artifact<TOutput>;
  handoff?: HandoffEnvelope<THandoff>;
  trace_refs: RefString[];
  errors: AgentError[];
  warnings: ValidationIssue[];
}

export interface HandoffEnvelope<TPayload = unknown> {
  handoff_id: string;
  handoff_type: string;
  schema_version: string;
  run_id: string;
  session_id?: string;
  from_stage: StageName;
  from_agent: AgentName;
  to_stage: StageName;
  to_agent: AgentName;
  artifact_refs: RefString[];
  context_refs: RefString[];
  evidence_refs: RefString[];
  validation_status: ValidationStatus;
  payload: TPayload;
  trace_refs: RefString[];
  created_at: IsoDateTime;
}

export interface AgentToolset {
  required: string[];
  optional: string[];
  forbidden: string[];
}

export interface AgentSpec<TInput = unknown, TOutput = unknown, THandoff = unknown> {
  stage: StageName;
  agent_id: AgentName;
  input_schema_ref: RefString;
  output_schema_ref: RefString;
  handoff_schema_ref?: RefString;
  tools: AgentToolset;
  run(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>>;
}

export interface ToolPortRegistry {
  call<TRequest = unknown, TResponse = unknown>(
    port: string,
    request: TRequest
  ): Promise<TResponse>;
}
```

## Stage-Specific Handoff Payloads

The common handoff envelope is stable. The `payload` is stage-specific.

Recommended initial handoff payload map:

```ts
export interface StageHandoffPayloads {
  ingest_to_understand: IngestToUnderstandPayload;
  understand_to_connect: UnderstandToConnectPayload;
  connect_to_verify: ConnectToVerifyPayload;
  plan_to_retrieve: PlanToRetrievePayload;
  retrieve_to_reason: RetrieveToReasonPayload;
  reason_to_verify: ReasonToVerifyPayload;
  verify_to_update: VerifyToUpdatePayload;
  update_to_curation: UpdateToCurationPayload;
  curation_to_evaluate: CurationToEvaluatePayload;
}

export interface IngestToUnderstandPayload {
  source_id: string;
  source_version_id: string;
  source_manifest_ref: RefString;
  ingest_artifact_ref: RefString;
  access_unit_refs: RefString[];
  preview_refs: RefString[];
  shallow_candidate_refs: RefString[];
  taxonomy_bundle_id: string;
  taxonomy_version: string;
  parser_policy_ref: RefString;
  source_content_hash: string;
  media_type: string;
  media_hint: string;
  validation_report_ref: RefString;
}

export interface UnderstandToConnectPayload {
  understanding_artifact_ref: RefString;
  knowledge_candidate_refs: RefString[];
  ambiguity_refs: RefString[];
  review_refs: RefString[];
  quality_report_ref: RefString;
  source_id: string;
  source_version_id: string;
  taxonomy_bundle_id: string;
  taxonomy_version: string;
}

export interface ConnectToVerifyPayload {
  connection_artifact_ref: RefString;
  relationship_proposal_refs: RefString[];
  conflict_candidate_refs: RefString[];
  unresolved_candidate_refs: RefString[];
  ambiguity_refs: RefString[];
  review_refs: RefString[];
  quality_report_ref: RefString;
  taxonomy_bundle_id: string;
  taxonomy_version: string;
}

export interface PlanToRetrievePayload {
  retrieval_plan_ref: RefString;
  required_evidence_types: string[];
  freshness_scope?: string;
  conflict_search_required: boolean;
}

export interface RetrieveToReasonPayload {
  evidence_bundle_ref: RefString;
  evidence_refs: RefString[];
  missing_evidence: string[];
  conflict_refs: RefString[];
}

export interface ReasonToVerifyPayload {
  draft_answer_ref?: RefString;
  proposed_action_ref?: RefString;
  evidence_bundle_ref: RefString;
  claim_refs: RefString[];
  assumption_refs: RefString[];
}

export interface VerifyToUpdatePayload {
  verification_report_ref: RefString;
  verified_claim_refs: RefString[];
  rejected_claim_refs: RefString[];
  update_candidate_refs: RefString[];
}

export interface UpdateToCurationPayload {
  update_candidate_refs: RefString[];
  source_refs: RefString[];
  evidence_refs: RefString[];
  requires_human_review: boolean;
}

export interface CurationToEvaluatePayload {
  curation_decision_refs: RefString[];
  accepted_record_refs: RefString[];
  rejected_candidate_refs: RefString[];
}
```

## Generic Base Agent Sketch

The implementation can use a class, function, or actor runtime. The important part is the contract, not inheritance itself.

```ts
export abstract class BaseAgent<TInput, TOutput, THandoff = never>
  implements AgentSpec<TInput, TOutput, THandoff>
{
  abstract stage: StageName;
  abstract agent_id: AgentName;
  abstract input_schema_ref: RefString;
  abstract output_schema_ref: RefString;
  abstract handoff_schema_ref?: RefString;
  abstract tools: AgentToolset;

  async run(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>> {
    this.validateTask(task);
    this.validateContext(context);
    this.validateToolGrants(task.allowed_tool_ports);

    const output = await this.execute(task, context, ports);
    return this.finalize(task, output);
  }

  protected abstract execute(
    task: AgentTask<TInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<AgentResult<TOutput, THandoff>>;

  protected validateTask(_task: AgentTask<TInput>): void {
    // Runtime schema validation belongs here.
  }

  protected validateContext(_context: ContextEnvelope): void {
    // Context bounds and required refs are checked here.
  }

  protected validateToolGrants(_allowedPorts: string[]): void {
    // Required, optional, and forbidden ports are enforced here.
  }

  protected finalize(
    _task: AgentTask<TInput>,
    result: AgentResult<TOutput, THandoff>
  ): AgentResult<TOutput, THandoff> {
    // Output schema validation and trace finalization belong here.
    return result;
  }
}
```

## Validation Rule

An agent can hand off only when:

- task schema validation passed;
- required context refs resolved;
- required tool ports were available;
- output artifact schema validation passed;
- handoff payload schema validation passed;
- validation status is `passed` or `passed_with_warnings`;
- any warnings are included in the handoff envelope.

If validation fails, the result may still be written as a failed artifact for inspection, but the orchestrator must not pass it to the next stage as normal input.

## Common vs Detailed Boundary

Common contract:

- agent task shape;
- context envelope shape;
- artifact metadata;
- provenance;
- validation summary;
- trace event;
- typed error;
- handoff envelope;
- tool port grant checks.

Detailed agent spec:

- what the agent means by evidence;
- which input fields are required;
- what payload it emits;
- what quality means for that stage;
- which next stage can consume the output;
- what must be reviewed by humans.

## Design Rule

Use one common runtime contract, many stage-specific payload schemas.

This keeps the system simple enough for v1 while preserving strict boundaries between agents.
