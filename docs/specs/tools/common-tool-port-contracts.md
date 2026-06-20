# Spec: Common Tool Port Contracts

This spec defines the shared runtime boundary for provider-independent tool
ports.

## Purpose

Define common contracts for:

- tool port IDs;
- request and response envelopes;
- tool errors;
- side effect levels;
- trace requirements.

## Scope

This spec applies to every tool port called by agents, commands, or orchestrator
modules through a tool registry.

It does not define the domain-specific input and output payloads for each tool.
Those belong to the meaning-group specs:

- [Source Tool Ports](source-tool-ports.md);
- [Document Structure Tool Ports](document-structure-tool-ports.md);
- [LLM Gateway Contract](llm-gateway-contract.md).

## Dependencies

This spec depends on:

- [Common Contracts And IDs](../contracts/common-contracts.md);
- [Storage And Indexing Contract](../stores/storage-indexing-contract.md).

## Naming Convention

TypeScript-facing request and response types use `camelCase`.

Persisted JSON, trace records, source records, manifests, and index projections
use `snake_case`.

Adapters and serializers own the mapping between those boundaries.

## Common Tool Port Interface

The runtime registry calls a port by `portId`.

```ts
export type ToolPortId =
  | "source.locate"
  | "source.read"
  | "source.write"
  | "source.version"
  | "parse.document"
  | "chunk.create"
  | "preview.create"
  | "schema.validate"
  | "artifact.read"
  | "artifact.write"
  | "audit.trace"
  | string;

export interface ToolPortRegistry {
  call<TRequest = unknown, TResponse = unknown>(
    portId: ToolPortId,
    request: TRequest
  ): Promise<Result<TResponse>>;

  getTraceRefs(): RefString[];
}
```

Every concrete tool handler must return `Result<TResponse>`.

Expected failures cross the boundary as typed errors. Unexpected implementation
failures may throw internally, but the registry or adapter must convert them
into a failed `Result` before returning to the agent or command.

## Common Tool Request Envelope

Every tool request should carry the same envelope fields.

```ts
export interface ToolRequestEnvelope<TInput = unknown> {
  schemaVersion: SchemaVersion;
  requestId: string;
  repositoryId: RepositoryId;
  runId?: RunId;
  sessionId?: SessionId;
  taskId?: TaskId;
  agentId?: string;
  portId: ToolPortId;
  intent: string;
  input: TInput;
  constraints?: ToolRequestConstraints;
  trace?: ToolTraceContext;
  createdAt: IsoDateTime;
}

export interface ToolRequestConstraints {
  allowWrites?: boolean;
  allowCurrentPointerUpdate?: boolean;
  allowHistoricalRead?: boolean;
  allowQuarantinedRead?: boolean;
  maxBytes?: number;
  expectedMediaHints?: MediaHint[];
  requiredRefs?: RefString[];
}

export interface ToolTraceContext {
  traceParentId?: TraceEventId;
  inputRefs: RefString[];
  policyRefs?: RefString[];
}
```

Rules:

- `repositoryId` is required so adapters do not infer repository scope from a path.
- `intent` must be specific enough to audit why the tool was called.
- `inputRefs` should name refs already known to the caller.
- large source bytes must not be placed in the envelope outside the port input.
- a port may reject a request if constraints are missing for a side effect.

## Common Tool Response Envelope

Every successful tool response should carry the same envelope fields.

```ts
export interface ToolResponseEnvelope<TOutput = unknown> {
  schemaVersion: SchemaVersion;
  requestId: string;
  portId: ToolPortId;
  status: "completed";
  output: TOutput;
  outputRefs: RefString[];
  traceRefs: RefString[];
  validation: ValidationSummary;
  sideEffects: ToolSideEffect[];
  createdAt: IsoDateTime;
}
```

Rules:

- `outputRefs` must include new or resolved refs that downstream stages may use.
- `traceRefs` must include trace records emitted by the port or registry.
- successful responses may still include validation warnings.
- a response that cannot satisfy its declared schema must be returned as an error.

## Common Tool Error Shape

Tool errors extend the common `ContractError`.

```ts
export interface ToolError extends ContractError {
  portId: ToolPortId;
  requestId?: string;
  repositoryId?: RepositoryId;
  retryAfterMs?: number;
  traceRefs?: RefString[];
}
```

Common error cases:

| Error code | Use when |
| --- | --- |
| `invalidInput` | required request fields are missing or inconsistent |
| `invalidId` | domain ID shape is invalid |
| `invalidRef` | a provided ref has the wrong kind or malformed syntax |
| `unresolvedRef` | a syntactically valid ref cannot be resolved |
| `missingSourceObject` | expected source bytes or metadata are absent |
| `hashMismatch` | observed bytes do not match expected SHA-256 |
| `schemaValidationFailed` | output does not match the declared schema |
| `storagePermissionDenied` | storage exists but the adapter cannot read or write it |
| `toolPermissionDenied` | the runtime did not grant this port or side effect |
| `unsupportedMedia` | media type or hint is not supported by this port configuration |
| `providerFailure` | backing local/S3-compatible/OpenSearch-compatible provider failed |
| `unknownFailure` | failure was normalized but not classified |

Errors should set `retryable = true` only for transient provider or permission
conditions where retrying the same request may succeed without changing input.

## Tool Side Effect Levels

```ts
export type ToolSideEffectLevel =
  | "none"
  | "read"
  | "writeImmutable"
  | "writeMutablePointer"
  | "appendTrace";

export interface ToolSideEffect {
  level: ToolSideEffectLevel;
  ref?: RefString;
  path?: StoragePath;
  description: string;
}
```

Rules:

- `read` means the tool inspected an existing store, ref, or provider.
- `writeImmutable` means the tool created a durable object that must not be overwritten.
- `writeMutablePointer` means the tool changed a pointer or lifecycle/status record.
- `appendTrace` means the tool or registry appended audit trace data.
- side effects must be declared in successful responses and trace records.

## Tool Trace Requirements

Every tool call must produce a trace entry that records:

- `port_id`;
- `request_id`;
- `repository_id`;
- `run_id`, `session_id`, and `task_id` when available;
- input refs;
- output refs;
- side effect levels;
- validation status;
- error code when failed;
- created timestamp;
- duration when measured by the registry.

Trace payloads must not include full source bytes, large model outputs, or
provider secrets.

## Acceptance Criteria

This common contract is ready when:

- request and response envelopes are defined;
- tool error shape is defined;
- side effect levels are defined;
- trace requirements are defined;
- meaning-group specs can reference these rules without repeating them.
