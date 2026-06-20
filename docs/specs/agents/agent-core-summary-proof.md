# Spec: SummaryAgent Prototype

This spec defines a small implementation-near prototype agent.

It combines one `StorageSupportable`-backed read tool with one `LlmGateway`.

`SummaryAgent` reads a path through a storage-backed tool and returns a summary result.

The prototype is also the first feasibility harness for checking whether the abstraction level is right before building the full agent and tool system.

## Purpose

Validate the smallest useful agent-tool connection before implementing the broader tool pool.

This proves:

- whether an agent should call a domain tool or a storage adapter directly;
- whether tool calls compose cleanly with LLM calls;
- whether the handoff between tool output and model input is explicit enough;
- whether each LLM model can reliably perform the same bounded summary task;
- storage adapter compatibility;
- byte-to-text conversion for Markdown-first input;
- optional common LLM gateway usage;
- summary artifact payload shape;
- validation and failure handling around model output.

## Scope

The prototype covers Markdown, text, and JSON-compatible content that can be decoded as UTF-8.

The input is one storage path.

The output is a summary result payload.

The same prototype may be repeated across multiple gateway adapters or model policies to compare feasibility.

## Non-Goals

- No full ingest pipeline.
- No taxonomy extraction.
- No OpenSearch write.
- No durable update.
- No multi-source synthesis.
- No media binary summary.
- No provider-specific LLM implementation.

## Core Decision

The prototype should be a pure orchestration function over explicit dependencies.

```text
SummaryAgent
  -> tool.read(path)
  -> StorageSupportable.read(path)
  -> decode bounded text
  -> LlmGateway.summarize(...)
  -> SummaryProofResult
```

`tool.read(path)` may be a very small wrapper around one `StorageSupportable`.

The prototype agent must not know which storage backend or LLM provider is used.

The LLM gateway must not know how storage is implemented.

## Abstraction Levels Under Review

`SummaryAgent` is intentionally small so the project can inspect the boundaries before locking the broader tool pool.

| Level | Prototype object | Owns | Must not own | Question being tested |
| --- | --- | --- | --- | --- |
| Agent | `SummaryAgent` | task flow, validation, result shaping | raw filesystem IO, provider SDK calls | Is the agent boundary small and readable? |
| Tool | `SummaryReadTool` | path-based read operation, storage error normalization | summary policy, model calls | Is `tool.read(path)` enough for first agent-tool coupling? |
| Store | `StorageSupportable` | actual read/describe behavior | model input construction | Can local and S3-compatible stores stay interchangeable? |
| Gateway | `LlmGateway` | model call, provider normalization | storage access, durable memory | Can multiple models be swapped without changing the agent? |
| Evaluation | `SummaryFeasibilityReport` | compare tool and model behavior | production ranking policy | Which models/adapters are feasible for this task? |

Design pressure to watch:

- if `SummaryAgent` needs provider-specific fields, the gateway is too thin;
- if `SummaryAgent` needs filesystem or S3 details, the read tool is too thin;
- if `SummaryReadTool` needs prompt or summary policy, the tool is too broad;
- if feasibility cannot be compared across models, the result metadata is too weak.

## Dependencies

- [Storage And Indexing Contract](../stores/storage-indexing-contract.md)
- [Common Contracts And IDs](../contracts/common-contracts.md)
- [LLM Gateway Contract](../tools/llm-gateway-contract.md)

## Public Interface

```ts
import type {
  ContentHash,
  MediaHint,
  RefString,
  Result,
  SchemaVersion,
  ValidationSummary
} from "../contracts/common-contracts";
import type {
  StorageObjectMeta,
  StoragePath,
  StorageSupportable
} from "../stores/storage-indexing-contract";
import type {
  LlmGateway,
  LlmModelInfo,
  LlmModelPolicy,
  LlmTraceContext
} from "../tools/llm-gateway-contract";

export interface SummaryAgentDeps<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  readTool: SummaryReadTool<TStorageData, TStorageMeta>;
  llmGateway: LlmGateway;
  clock?: Clock;
  contentHasher?: ContentHasher;
}

export interface SummaryReadTool<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  read(path: StoragePath): Promise<SummaryReadResult<TStorageData, TStorageMeta>>;
}

export interface SummaryAgent {
  summarizePath(
    input: SummarizePathInput
  ): Promise<Result<SummaryProofResult>>;

  evaluateFeasibility?(
    input: SummarizePathFeasibilityInput
  ): Promise<Result<SummaryFeasibilityReport>>;
}
```

## TypeScript Types

```ts
export type SummaryProofId = string;

export interface Clock {
  now(): Date;
}

export interface ContentHasher {
  sha256(data: Buffer | string): ContentHash;
}

export interface SummaryReadResult<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  data: TStorageData;
  meta: TStorageMeta;
}

export interface SummarizePathInput {
  schemaVersion: SchemaVersion;
  proofId: SummaryProofId;
  path: StoragePath;
  sourceRef?: RefString;
  mediaHint?: MediaHint;
  encoding?: "utf8";
  maxInputChars?: number;
  maxSummaryChars?: number;
  languageHint?: string;
  trace?: LlmTraceContext;
}

export interface SummarizePathFeasibilityInput {
  schemaVersion: SchemaVersion;
  proofId: SummaryProofId;
  path: StoragePath;
  modelPolicies: SummaryModelPolicyCase[];
  sourceRef?: RefString;
  mediaHint?: MediaHint;
  encoding?: "utf8";
  maxInputChars?: number;
  maxSummaryChars?: number;
  languageHint?: string;
  trace?: LlmTraceContext;
}

export interface SummaryModelPolicyCase {
  caseId: string;
  label: string;
  modelPolicy?: LlmModelPolicy;
}

export interface SummaryProofResult {
  schemaVersion: SchemaVersion;
  proofId: SummaryProofId;
  path: StoragePath;
  sourceRef?: RefString;
  mediaHint?: MediaHint;
  input: SummaryProofInputMeta;
  summary: SummaryProofSummary;
  validation: ValidationSummary;
  createdAt: string;
}

export interface SummaryProofInputMeta {
  byteSize?: number;
  charSize: number;
  contentHash?: ContentHash;
  storageMeta: StorageObjectMeta;
  truncated: boolean;
}

export interface SummaryProofSummary {
  text: string;
  outputRefs: RefString[];
  modelInfo: LlmModelInfo;
}

export interface SummaryToolCallReport {
  toolName: "summary.read";
  path: StoragePath;
  storageProvider?: string;
  byteSize?: number;
  durationMs?: number;
  succeeded: boolean;
  errorCode?: string;
}

export interface SummaryLlmCallReport {
  caseId: string;
  label: string;
  modelInfo?: LlmModelInfo;
  durationMs?: number;
  inputCharSize: number;
  outputCharSize?: number;
  succeeded: boolean;
  errorCode?: string;
}

export interface SummaryFeasibilityScore {
  schemaValid: boolean;
  nonEmptySummary: boolean;
  withinLengthLimit: boolean;
  preservesSourceLanguage?: boolean;
  avoidsUnsupportedClaims?: boolean;
  deterministicEnough?: boolean;
  notes?: string[];
}

export interface SummaryFeasibilityCaseResult {
  caseId: string;
  label: string;
  result?: SummaryProofResult;
  llmCall: SummaryLlmCallReport;
  score: SummaryFeasibilityScore;
}

export interface SummaryFeasibilityReport {
  schemaVersion: SchemaVersion;
  proofId: SummaryProofId;
  path: StoragePath;
  sourceRef?: RefString;
  mediaHint?: MediaHint;
  input: SummaryProofInputMeta;
  readCall: SummaryToolCallReport;
  cases: SummaryFeasibilityCaseResult[];
  recommendedCaseId?: string;
  validation: ValidationSummary;
  createdAt: string;
}
```

## Required Prototype Algorithm

1. Call `readTool.read(path)`.
2. Validate that the object exists and is readable through the returned metadata.
3. Convert the returned data to text:
   - `Buffer` uses `toString("utf8")`;
   - `string` is used directly;
   - any other type requires an explicit decoder and is out of scope for this prototype.
4. Trim only for validation; preserve the bounded text body sent to the gateway.
5. Apply `maxInputChars` if provided and mark `truncated`.
6. Compute `contentHash` when a hasher is provided.
7. Call `llmGateway.summarize`.
8. Validate that the gateway response contains non-empty `summaryText`.
9. Return `SummaryProofResult`.

## Feasibility Evaluation Algorithm

`evaluateFeasibility` is optional, but it is the preferred way to use this prototype when comparing LLM models.

1. Read and decode the input once through `readTool.read(path)`.
2. Build a shared bounded text body and shared `inputRefs`.
3. For each `SummaryModelPolicyCase`:
   - call `llmGateway.summarize` with the case-specific `modelPolicy`;
   - record model metadata, duration, usage, success, and normalized error;
   - validate the summary against the same rules;
   - produce a `SummaryFeasibilityCaseResult`.
4. Select `recommendedCaseId` only when the selection rule is explicit.
5. Return `SummaryFeasibilityReport`.

The prototype should never select a production model implicitly.

Feasibility checks answer only:

- can this model complete the requested shape?
- is the output valid enough for this agent-tool pattern?
- what limitations or adapter issues appeared?

## Minimal Read Tool

The first read tool can be a thin adapter over one `StorageSupportable`.

```ts
export class StorageSummaryReadTool<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> implements SummaryReadTool<TStorageData, TStorageMeta> {
  constructor(
    private readonly storage: StorageSupportable<TStorageData, TStorageMeta>
  ) {}

  async read(
    path: StoragePath
  ): Promise<SummaryReadResult<TStorageData, TStorageMeta>> {
    const meta = await this.storage.describe(path);
    const data = await this.storage.read(path);
    return { data, meta };
  }
}
```

## LLM Gateway Coupling

`SummaryAgent` should make the LLM call only after the read tool has returned explicit data and metadata.

The gateway request should include:

- bounded `inputText`;
- `inputRefs`, preferably source/version refs when available;
- `inputContentHash` when available;
- `purpose: "summaryAgentPrototype"`;
- `maxSummaryChars`;
- `languageHint`;
- case-specific `modelPolicy` when evaluating feasibility.

The gateway response should be treated as untrusted until validated.

The agent should not pass raw provider request options except through `LlmModelPolicy`.

## Model Feasibility Dimensions

Each model or adapter should be assessed on these dimensions.

| Dimension | Question | Evidence |
| --- | --- | --- |
| Adapter fit | Can the gateway call the model without provider-specific leakage? | `modelInfo`, normalized errors |
| Schema fit | Does the response satisfy `LlmSummaryResponse`? | validation summary |
| Summary usefulness | Is the summary non-empty, bounded, and relevant? | score flags and reviewer notes |
| Language fit | Does it preserve or follow the requested language? | `preservesSourceLanguage` |
| Grounding discipline | Does it avoid claims not present in input? | `avoidsUnsupportedClaims` |
| Stability | Is repeated output stable enough for fixtures? | `deterministicEnough` |
| Cost/latency shape | Is the call acceptable for prototype use? | usage and duration metadata |

This report is not a benchmark suite.

It is a feasibility check for whether the agent-tool-gateway abstraction works cleanly.

## Input Contracts

- `path` must be a storage path, not a raw filesystem operation outside the storage adapter.
- `encoding` defaults to `utf8`.
- `mediaHint` should be `md`, `txt`, or `json` for the prototype.
- `sourceRef` is recommended when the path already belongs to a known source/version.
- `maxInputChars` should be provided in CLI or fixture-driven tests.
- `maxSummaryChars` should be forwarded to `LlmGateway.summarize`.

## Output Contracts

`SummaryProofResult` is an artifact-ready payload.

It may be written later by an artifact store, but this proof does not require persistence.

The summary result must include:

- source path;
- optional source ref;
- storage metadata;
- content hash when available;
- whether input was truncated;
- model info;
- validation summary.

It must not include:

- provider SDK raw response;
- hidden conversation state;
- unrelated source content;
- OpenSearch projection fields.

`SummaryFeasibilityReport` must not be written to the index.

It is a prototype/evaluation artifact only.

## Failure Modes

| Failure | Required behavior |
| --- | --- |
| missing path | return typed read-tool not-found error |
| unreadable path | return typed read-tool error |
| unsupported data type | return typed decoder unsupported error |
| empty decoded text | return typed validation error |
| input exceeds limit and truncation is disabled later | return typed bounded-input error |
| gateway failure | propagate normalized gateway error |
| empty summary | return typed validation error |

## Trace Events

The implementation should emit or allow the caller to emit:

- `summary_proof.started`;
- `summary_read_tool.read.requested`;
- `summary_read_tool.read.completed`;
- `llm.summary.requested`;
- `llm.summary.completed`;
- `summary_feasibility.case_completed`;
- `summary_proof.completed`;
- `summary_proof.failed`.

Trace payloads must reference the path and refs, not embed full source text.

## Fixture Plan

Minimum fixtures:

- small Markdown document;
- Markdown document with frontmatter;
- JSON document;
- empty file negative case;
- oversized Markdown with truncation enabled.

Expected outputs should use `MockLlmGateway` so the result is deterministic.

Feasibility fixtures:

- one mock model case that succeeds;
- one no-op or disabled model case that fails cleanly;
- one oversized input case that verifies bounded input behavior;
- one language-hint case.

## Acceptance Criteria

- `SummaryAgent` can run with one local `StorageSupportable<Buffer>` through one read tool and one `MockLlmGateway`.
- The same prototype can later run with S3-compatible storage without changing `SummaryAgent`.
- `SummaryAgent` does not import provider SDKs.
- The gateway does not import storage adapters.
- `SummaryAgent` can compare multiple model policies without changing the read tool.
- tool call reports and LLM call reports are separate.
- feasibility reports clearly distinguish tool failures from model failures.
- feasibility reports are prototype/evaluation artifacts, not production model selection records.
- The result payload is usable as a future preview or understanding input, but does not claim durable knowledge.
- Code-facing types use `camelCase`; persisted examples use `snake_case`.

## Open Questions

- Whether the proof result should be stored under `artifacts/understand/` or a separate `artifacts/proofs/` path.
- Whether Markdown chunking should be introduced before or after this single-path proof.
