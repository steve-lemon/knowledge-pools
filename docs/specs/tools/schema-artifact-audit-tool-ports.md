# Spec: Schema, Artifact, And Audit Tool Ports

This spec defines the P0 runtime support tool ports used by Markdown-first
agents and commands.

## Purpose

Define implementation-facing contracts for:

- `schema.validate`;
- `artifact.read`;
- `artifact.write`;
- `audit.trace`.

## Scope

These ports support validation, artifact storage, and append-only execution
tracing.

They use the common runtime boundary from
[Common Tool Port Contracts](common-tool-port-contracts.md).

## Non-Goals

- No broad runtime orchestrator implementation.
- No production schema registry implementation.
- No database-backed artifact store.
- No analytics or observability platform.
- No durable knowledge record write.
- No source object write.

## Dependencies

This spec depends on:

- [Common Tool Port Contracts](common-tool-port-contracts.md);
- [Common Contracts And IDs](../contracts/common-contracts.md);
- [Local Store Layout](../stores/local-store-layout.md);
- [Agent Core Summary Proof](../agents/agent-core-summary-proof.md), for the prototype use case.

## Core Rules

- schema validation must return a `ValidationSummary`;
- artifacts must be JSON-compatible and include metadata, payload, provenance, and validation;
- artifact writes are append-oriented by default;
- trace records are append-only JSON-compatible audit events;
- traces reference artifacts, tasks, tools, and source refs, but do not replace artifacts;
- failed validation blocks normal handoff or active projection writes.

## Side Effects

| Port | Side effects |
| --- | --- |
| `schema.validate` | `read` for schema lookup, no durable write |
| `artifact.read` | `read` |
| `artifact.write` | `writeImmutable` |
| `audit.trace` | `appendTrace` |

## `schema.validate`

Purpose:

Validate a JSON-compatible value against a declared schema or contract ref.

Typical callers:

- agents validating output payloads before artifact write;
- CLI commands validating command result envelopes;
- orchestrator modules validating handoffs;
- index tools validating projection shape before active writes.

### Input

```ts
export interface SchemaValidateInput {
  schemaRef: RefString;
  value: unknown;
  valueRef?: RefString;
  mode: "strict" | "compatibility" | "advisory";
  namingContext: "typescript" | "persistedJson" | "indexProjection";
  allowWarnings: boolean;
}
```

Rules:

- `schemaRef` must identify a known contract or schema.
- `strict` mode fails when required fields, enum values, or naming conventions do not match.
- `compatibility` mode allows additive optional fields when contract versioning permits them.
- `advisory` mode may return warnings without blocking artifact inspection.
- validation paths use `camelCase` for TypeScript objects and `snake_case` for persisted JSON/index objects.

### Output

```ts
export interface SchemaValidateOutput {
  schemaRef: RefString;
  valueRef?: RefString;
  validation: ValidationSummary;
  normalizedValueRef?: RefString;
}
```

Rules:

- the output must always include a `ValidationSummary`;
- `normalizedValueRef` is optional and points to a separately stored normalized object only when a later implementation supports it;
- this port does not write artifacts by itself.

### Failure Modes

- unresolved schema ref;
- unsupported schema version;
- invalid input shape;
- schema execution failure;
- validation failed and `allowWarnings = false` when warnings are blocking under policy.

## `artifact.read`

Purpose:

Read a stored artifact by ref or by repository-scoped artifact path.

Typical callers:

- agents consuming prior stage artifacts;
- orchestrator modules assembling context envelopes;
- validation harnesses replaying runs;
- CLI inspection commands.

### Input

```ts
export type ArtifactReadTarget =
  | { kind: "artifactRef"; ref: RefString }
  | { kind: "artifactId"; artifactId: ArtifactId; stage?: string }
  | { kind: "artifactPath"; path: StoragePath };

export interface ArtifactReadInput {
  target: ArtifactReadTarget;
  expectedSchemaRef?: RefString;
  includePayload: boolean;
  maxPayloadBytes?: number;
}
```

Rules:

- `includePayload = false` returns metadata only.
- `maxPayloadBytes` is required when agents read arbitrary prior artifacts into context.
- artifact refs must resolve under the configured repository.
- artifact payloads should reference source-sized content rather than embedding it.

### Output

```ts
export interface ArtifactReadOutput<TPayload = unknown> {
  artifactRef: RefString;
  artifact: ArtifactView<TPayload>;
  payloadIncluded: boolean;
  truncated: boolean;
}

export interface ArtifactView<TPayload = unknown> {
  meta: ArtifactMetaView;
  payload?: TPayload;
}

export interface ArtifactMetaView {
  artifactId: ArtifactId;
  artifactType: string;
  schemaVersion: SchemaVersion;
  stage: string;
  createdAt: IsoDateTime;
  createdBy: string;
  runId: RunId;
  sessionId?: SessionId;
  taskId: TaskId;
  validation: ValidationSummary;
  provenance?: Provenance;
}
```

Rules:

- metadata is always returned.
- payload may be omitted or truncated according to request constraints.
- if `expectedSchemaRef` is provided, the artifact must be validated or have a compatible stored validation summary.

### Failure Modes

- unresolved artifact ref;
- artifact path escapes repository root;
- payload exceeds `maxPayloadBytes`;
- schema mismatch;
- stored artifact JSON is malformed;
- storage provider failure.

## `artifact.write`

Purpose:

Write a validated artifact to the artifact store.

Typical callers:

- agents emitting stage artifacts;
- validation tools storing reports;
- prototype `SummaryAgent` writing `summary_proof_result` or `summary_feasibility_report`;
- orchestrator modules storing handoff-adjacent artifacts.

### Input

```ts
export interface ArtifactWriteInput<TPayload = unknown> {
  artifact: ArtifactView<TPayload>;
  schemaRef: RefString;
  validation: ValidationSummary;
  writePolicy: ArtifactWritePolicy;
}

export interface ArtifactWritePolicy {
  ifExists: "fail" | "reuseIdentical" | "overwriteDraft";
  requirePassedValidation: boolean;
  stagePath?: string;
}
```

Rules:

- production-like artifact writes are append-oriented and should use `ifExists = "fail"`.
- `overwriteDraft` is allowed only for explicitly marked draft or fixture artifacts.
- `requirePassedValidation = true` blocks writes with failed validation.
- artifact metadata and validation summary must agree on schema version and validator identity.
- artifact payload must be JSON-compatible.

### Output

```ts
export interface ArtifactWriteOutput {
  artifactRef: RefString;
  artifactId: ArtifactId;
  artifactPath?: StoragePath;
  writeDisposition: "created" | "reusedIdentical" | "overwroteDraft";
  validation: ValidationSummary;
}
```

Rules:

- `artifactRef` must be resolvable by `artifact.read`.
- local artifact paths follow `knowledge/artifacts/{stage}/{artifact_id}.json`.
- the port may return an in-memory ref in prototype mode, but future persistent implementations must map it to a repository-scoped path.

### Failure Modes

- validation failed and policy requires passed validation;
- artifact already exists and policy is `fail`;
- artifact payload is not JSON-compatible;
- artifact metadata is missing required run/task/stage fields;
- storage provider failure.

## `audit.trace`

Purpose:

Append a trace event that records what happened during a tool call, agent step,
decision, validation, or handoff.

Typical callers:

- tool registries recording tool calls;
- agents recording major step boundaries;
- validation tools recording pass/fail events;
- orchestrators recording task dispatch and handoff checks.

### Input

```ts
export interface AuditTraceInput {
  eventType: string;
  runId?: RunId;
  sessionId?: SessionId;
  taskId?: TaskId;
  agentId?: string;
  portId?: ToolPortId;
  refs: RefString[];
  inputRefs?: RefString[];
  outputRefs?: RefString[];
  sideEffects?: ToolSideEffect[];
  status: "started" | "completed" | "failed" | "blocked";
  message?: string;
  error?: ToolError;
  details?: Record<string, unknown>;
  occurredAt?: IsoDateTime;
}
```

Rules:

- trace payloads must not include full source bytes, large artifact payloads, provider secrets, or hidden provider session state.
- refs should be used instead of embedding large payloads.
- `eventType` should be stable and namespaced by subsystem, such as `tool.call.completed`.
- failed events should include an error code.
- traces are append-only and must not replace artifacts.

### Output

```ts
export interface AuditTraceOutput {
  traceRef: RefString;
  traceEventId: TraceEventId;
  tracePath?: StoragePath;
  appendedAt: IsoDateTime;
}
```

Rules:

- `traceRef` must be usable by later validation and replay tools.
- local trace paths follow `knowledge/traces/runs/{run_id}.jsonl` or `knowledge/traces/tools/{run_id}.jsonl` when a run id is available.
- prototype in-memory traces may use deterministic local refs such as `trace:audit:1`.

### Failure Modes

- invalid refs;
- non-JSON-compatible details;
- trace append permission denied;
- trace path cannot be resolved;
- storage provider failure.

## Prototype Compatibility

The current `SummaryAgent` prototype may keep minimal in-memory implementations:

- `schema.validate` may return a passed validation summary for known prototype schema refs;
- `artifact.write` may write to an in-memory map;
- `audit.trace` may append to an in-memory array;
- `artifact.read` may be absent until a prototype flow needs to consume prior artifacts.

These prototype shortcuts must remain behind the same port IDs and result shapes
so later persistent implementations can replace them.

## Open Questions

- Should `artifact.read` and `artifact.write` share a single artifact store adapter, or remain separate ports for stricter tool grants?
- Should handoffs be handled by artifact ports initially, or receive a dedicated `handoff.read/write` port in the runtime/orchestrator spec?
- Should trace records be validated synchronously by `audit.trace`, or asynchronously by the validation harness?

## Acceptance Criteria

This spec is ready when:

- `schema.validate` returns validation summaries for contract refs;
- `artifact.read` can resolve metadata and optional payloads;
- `artifact.write` can store validated JSON-compatible artifacts;
- `audit.trace` can append trace records without embedding source-sized payloads;
- all four ports align with the `SummaryAgent` prototype and future Markdown-first stage runs.
