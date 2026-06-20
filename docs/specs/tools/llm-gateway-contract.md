# Spec: LLM Gateway Contract

This spec defines the common LLM access boundary.

Agents must not call provider SDKs directly.

They call `LlmGateway`, and provider-specific behavior stays behind adapters.

## Purpose

Define a provider-independent gateway for:

- summary generation;
- structured completion when needed later;
- deterministic mock behavior for core agent tests;
- model usage, provenance, validation, and trace metadata.

## Scope

This spec covers Markdown-first validation.

The first required behavior is summary generation from text already read from storage.

## Non-Goals

- No provider SDK implementation.
- No prompt library.
- No model selection optimizer.
- No conversational memory store.
- No vector embedding contract.
- No durable knowledge update.

## Core Decision

LLM usage belongs to a common gateway.

Agent core logic owns:

- selecting input refs;
- reading or receiving bounded input;
- preparing the gateway request;
- validating the gateway response;
- returning an artifact-ready result.

The gateway owns:

- provider adapter selection;
- request execution;
- usage metadata normalization;
- model identity normalization;
- provider error normalization.

## Public Interfaces

```ts
import type {
  ContentHash,
  IsoDateTime,
  RefString,
  Result,
  SchemaVersion,
  ValidationSummary
} from "../contracts/common-contracts";

export interface LlmGateway {
  summarize(request: LlmSummaryRequest): Promise<Result<LlmSummaryResponse>>;
  complete?<TOutput = unknown>(
    request: LlmCompleteRequest
  ): Promise<Result<LlmCompleteResponse<TOutput>>>;
}
```

`summarize` is required for P0.

`complete` is optional until a later agent spec needs generic structured output.

## TypeScript Types

```ts
export type LlmGatewayId = string;
export type LlmProviderId = string;
export type LlmModelId = string;
export type LlmRequestId = string;

export type LlmSummaryPurpose =
  | "preview"
  | "agentCoreProof"
  | "evidenceTriage"
  | "questionUnderstanding";

export interface LlmTraceContext {
  runId?: string;
  sessionId?: string;
  taskId?: string;
  traceParentId?: string;
}

export interface LlmModelPolicy {
  providerHint?: LlmProviderId;
  modelHint?: LlmModelId;
  maxOutputTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface LlmSummaryRequest {
  schemaVersion: SchemaVersion;
  requestId: LlmRequestId;
  purpose: LlmSummaryPurpose;
  inputText: string;
  inputRefs: RefString[];
  inputContentHash?: ContentHash;
  maxSummaryChars?: number;
  languageHint?: string;
  modelPolicy?: LlmModelPolicy;
  trace?: LlmTraceContext;
}

export interface LlmSummaryResponse {
  schemaVersion: SchemaVersion;
  requestId: LlmRequestId;
  summaryText: string;
  outputRefs: RefString[];
  modelInfo: LlmModelInfo;
  usage?: LlmUsage;
  validation: ValidationSummary;
  createdAt: IsoDateTime;
}

export interface LlmModelInfo {
  gatewayId: LlmGatewayId;
  providerId: LlmProviderId;
  modelId: LlmModelId;
  adapterVersion: string;
}

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimated?: boolean;
}

export interface LlmCompleteRequest {
  schemaVersion: SchemaVersion;
  requestId: LlmRequestId;
  instruction: string;
  inputText?: string;
  inputRefs: RefString[];
  modelPolicy?: LlmModelPolicy;
  trace?: LlmTraceContext;
}

export interface LlmCompleteResponse<TOutput = unknown> {
  schemaVersion: SchemaVersion;
  requestId: LlmRequestId;
  output: TOutput;
  outputRefs: RefString[];
  modelInfo: LlmModelInfo;
  usage?: LlmUsage;
  validation: ValidationSummary;
  createdAt: IsoDateTime;
}
```

## Persisted JSON Shape

Runtime code uses `camelCase`.

Persisted JSON, trace records, and OpenSearch-compatible projection records use `snake_case`.

Example trace payload:

```json
{
  "schema_version": "2026-06-20",
  "request_id": "llmreq_01HXYZ",
  "purpose": "agentCoreProof",
  "input_refs": ["sourceVersion:srcv_md_sha256_ab12cd34ef90"],
  "model_info": {
    "gateway_id": "llm_gateway_mock",
    "provider_id": "mock",
    "model_id": "summary_stub_v1",
    "adapter_version": "v1"
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 40,
    "total_tokens": 160,
    "estimated": true
  }
}
```

## Required Adapters

P0 requires:

- `MockLlmGateway`: deterministic, no network, fixture-friendly;
- `NoopLlmGateway`: returns explicit unsupported errors when model use is disabled.

P1 may add:

- provider-specific gateway adapters;
- local model gateway adapters.

## Validation Rules

- `inputText` must be non-empty after trimming.
- `inputText` must be bounded by caller policy before gateway invocation.
- `inputRefs` must include at least one resolvable source, artifact, or access-unit ref.
- `summaryText` must be non-empty after trimming.
- `summaryText` must not exceed `maxSummaryChars` when that value is provided.
- `outputRefs` must not introduce refs unrelated to `inputRefs` unless the agent explicitly allows derived artifact refs.
- `modelInfo` is required even for mock adapters.
- gateway adapters must not persist hidden conversation state.

## Failure Modes

| Failure | Required behavior |
| --- | --- |
| empty input | return typed validation error |
| input too large | return typed bounded-input error |
| provider unavailable | return typed gateway unavailable error |
| provider timeout | return typed timeout error with retry hint |
| invalid response | return typed validation error |
| model disabled | return typed unsupported capability error |

## Trace Events

Every gateway call should produce or allow the caller to produce:

- `llm.requested`;
- `llm.completed`;
- `llm.failed`.

Trace records must include refs and metadata, not full source content.

## Acceptance Criteria

- Agents can depend on `LlmGateway` without importing provider SDKs.
- A deterministic mock gateway can validate agent core behavior without network access.
- Summary generation can be tested with one `StorageSupportable` and one `LlmGateway`.
- Provider-specific adapter fields do not leak into agent-facing TypeScript types.
- Persisted records follow `snake_case`; code-facing types follow `camelCase`.

## Open Questions

- Whether structured completion should remain optional or become a separate `StructuredLlmGateway`.
- Whether prompt templates deserve a separate spec after the first Markdown summary proof.
