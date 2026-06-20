import { createHash } from "node:crypto";
import type {
  ContentHash,
  MediaHint,
  RefString,
  Result,
  SchemaVersion,
  StoragePath,
  ValidationSummary
} from "../contracts/common.js";
import { err, ok, passedValidation } from "../contracts/common.js";
import type { StorageObjectMeta } from "../stores/storage-supportable.js";
import type {
  LlmGateway,
  LlmModelInfo,
  LlmModelPolicy,
  LlmTraceContext
} from "../tools/llm-gateway.js";
import type {
  SummaryReadTool,
  SummaryReadResult
} from "../tools/summary-read-tool.js";

export type SummaryProofId = string;

export interface SummaryAgentDeps<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  readTool: SummaryReadTool<TStorageData, TStorageMeta>;
  llmGateway: LlmGateway;
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
  modelPolicy?: LlmModelPolicy;
  trace?: LlmTraceContext;
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

export class SummaryAgent<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  constructor(
    private readonly deps: SummaryAgentDeps<TStorageData, TStorageMeta>
  ) {}

  async summarizePath(
    input: SummarizePathInput
  ): Promise<Result<SummaryProofResult>> {
    const readResult = await this.safeRead(input.path);

    if (!readResult.ok) {
      return readResult;
    }

    const decoded = this.decodeInput(readResult.value, input.encoding ?? "utf8");

    if (!decoded.ok) {
      return decoded;
    }

    const bounded = this.boundInput(decoded.value, input.maxInputChars);

    if (!bounded.text.trim()) {
      return err("empty_decoded_text", "Decoded input is empty.");
    }

    const contentHash = this.hashContent(decoded.value);
    const inputRefs = input.sourceRef ? [input.sourceRef] : [`path:${input.path}`];

    const summaryResult = await this.deps.llmGateway.summarize({
      schemaVersion: input.schemaVersion,
      requestId: `llmreq_${input.proofId}`,
      purpose: "summaryAgentPrototype",
      inputText: bounded.text,
      inputRefs,
      inputContentHash: contentHash,
      maxSummaryChars: input.maxSummaryChars,
      languageHint: input.languageHint,
      modelPolicy: input.modelPolicy,
      trace: input.trace
    });

    if (!summaryResult.ok) {
      return err(
        "model_failure",
        summaryResult.error.message,
        summaryResult.error.retryable,
        { cause: summaryResult.error }
      );
    }

    const summaryText = summaryResult.value.summaryText.trim();

    if (!summaryText) {
      return err("empty_summary", "LLM gateway returned an empty summary.");
    }

    return ok({
      schemaVersion: input.schemaVersion,
      proofId: input.proofId,
      path: input.path,
      sourceRef: input.sourceRef,
      mediaHint: input.mediaHint,
      input: {
        byteSize: readResult.value.meta.byteSize,
        charSize: decoded.value.length,
        contentHash,
        storageMeta: readResult.value.meta,
        truncated: bounded.truncated
      },
      summary: {
        text: summaryText,
        outputRefs: summaryResult.value.outputRefs,
        modelInfo: summaryResult.value.modelInfo
      },
      validation: passedValidation("schema:summary_proof_result:v1"),
      createdAt: new Date().toISOString()
    });
  }

  private async safeRead(
    path: StoragePath
  ): Promise<Result<SummaryReadResult<TStorageData, TStorageMeta>>> {
    try {
      return ok(await this.deps.readTool.read({ path }));
    } catch (error) {
      return err("summary_read_failed", `Failed to read path: ${path}`, false, {
        cause: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private decodeInput(
    readResult: SummaryReadResult<TStorageData, TStorageMeta>,
    encoding: "utf8"
  ): Result<string> {
    const data = readResult.data;

    if (Buffer.isBuffer(data)) {
      return ok(data.toString(encoding));
    }

    if (typeof data === "string") {
      return ok(data);
    }

    return err(
      "unsupported_data_type",
      "SummaryAgent prototype supports Buffer and string data only."
    );
  }

  private boundInput(
    text: string,
    maxInputChars?: number
  ): { text: string; truncated: boolean } {
    if (!maxInputChars || text.length <= maxInputChars) {
      return { text, truncated: false };
    }

    return { text: text.slice(0, maxInputChars), truncated: true };
  }

  private hashContent(text: string): ContentHash {
    return `sha256:${createHash("sha256").update(text).digest("hex")}`;
  }
}

export function toSummaryProofJson(result: SummaryProofResult): unknown {
  return {
    schema_version: result.schemaVersion,
    proof_id: result.proofId,
    path: result.path,
    source_ref: result.sourceRef,
    media_hint: result.mediaHint,
    input: {
      byte_size: result.input.byteSize,
      char_size: result.input.charSize,
      content_hash: result.input.contentHash,
      storage_meta: {
        path: result.input.storageMeta.path,
        provider: result.input.storageMeta.provider,
        byte_size: result.input.storageMeta.byteSize,
        content_hash: result.input.storageMeta.contentHash,
        created_at: result.input.storageMeta.createdAt,
        updated_at: result.input.storageMeta.updatedAt
      },
      truncated: result.input.truncated
    },
    summary: {
      text: result.summary.text,
      output_refs: result.summary.outputRefs,
      model_info: {
        gateway_id: result.summary.modelInfo.gatewayId,
        provider_id: result.summary.modelInfo.providerId,
        model_id: result.summary.modelInfo.modelId,
        adapter_version: result.summary.modelInfo.adapterVersion
      }
    },
    validation: {
      status: result.validation.status,
      schema_ref: result.validation.schemaRef,
      checked_at: result.validation.checkedAt,
      errors: result.validation.errors,
      warnings: result.validation.warnings
    },
    created_at: result.createdAt
  };
}
