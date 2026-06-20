# Spec: SummaryAgent Prototype

This spec defines a small implementation-near prototype agent.

It combines one `StorageSupportable`-backed read tool with one `LlmGateway`.

`SummaryAgent` reads a path through a storage-backed tool and returns a summary result.

## Purpose

Validate the smallest useful agent-tool connection before implementing the broader tool pool.

This proves:

- storage adapter compatibility;
- byte-to-text conversion for Markdown-first input;
- optional common LLM gateway usage;
- summary artifact payload shape;
- validation and failure handling around model output.

## Scope

The prototype covers Markdown, text, and JSON-compatible content that can be decoded as UTF-8.

The input is one storage path.

The output is a summary result payload.

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
- `llm.summary.requested`;
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

## Acceptance Criteria

- `SummaryAgent` can run with one local `StorageSupportable<Buffer>` through one read tool and one `MockLlmGateway`.
- The same prototype can later run with S3-compatible storage without changing `SummaryAgent`.
- `SummaryAgent` does not import provider SDKs.
- The gateway does not import storage adapters.
- The result payload is usable as a future preview or understanding input, but does not claim durable knowledge.
- Code-facing types use `camelCase`; persisted examples use `snake_case`.

## Open Questions

- Whether the proof result should be stored under `artifacts/understand/` or a separate `artifacts/proofs/` path.
- Whether Markdown chunking should be introduced before or after this single-path proof.
