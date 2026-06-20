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
import { BaseAgent } from "../runtime/base-agent.js";
import type {
  AgentTask,
  AgentToolset,
  Artifact,
  ContextEnvelope
} from "../runtime/agent-contracts.js";
import type { ToolPortRegistry } from "../runtime/tool-port-registry.js";
import type { StorageObjectMeta } from "../stores/storage-supportable.js";
import type {
  LlmModelInfo,
  LlmModelPolicy,
  LlmSummaryRequest,
  LlmSummaryResponse,
  LlmTraceContext
} from "../tools/llm-gateway.js";
import type {
  SummaryReadRequest,
  SummaryReadResult
} from "../tools/summary-read-tool.js";

export type SummaryProofId = string;

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
> extends BaseAgent<SummarizePathInput, SummaryProofResult> {
  readonly stage = "prototype" as const;
  readonly agentId = "summary_agent" as const;
  readonly outputSchemaRef = "schema:summary_proof_result:v1";
  readonly tools: AgentToolset = {
    required: [
      "summary.read",
      "llm.summarize",
      "schema.validate",
      "artifact.write",
      "audit.trace"
    ],
    optional: ["llm.describe_capabilities", "artifact.read"],
    forbidden: [
      "source.write",
      "source.version",
      "index.write_projection",
      "index.deactivate_projection",
      "candidate.emit",
      "memory.write",
      "curation.decide",
      "source.tombstone",
      "delete.create_tombstone",
      "rollback.create_event"
    ]
  };

  protected async execute(
    task: AgentTask<SummarizePathInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ) {
    const input = task.input;
    const readResult = await ports.call<
      SummaryReadRequest,
      SummaryReadResult<TStorageData, TStorageMeta>
    >("summary.read", { path: input.path });

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

    this.logger.debug(
      "summary_agent.input.prepared",
      "SummaryAgent input prepared.",
      {
        taskId: task.taskId,
        runId: task.runId,
        proofId: input.proofId,
        path: input.path,
        mediaHint: input.mediaHint,
        charSize: decoded.value.length,
        byteSize: readResult.value.meta.byteSize,
        truncated: bounded.truncated,
        contentHash
      }
    );

    const summaryResult = await ports.call<
      LlmSummaryRequest,
      LlmSummaryResponse
    >("llm.summarize", {
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
      return summaryResult;
    }

    const summaryText = summaryResult.value.summaryText.trim();

    if (!summaryText) {
      return err("empty_summary", "LLM gateway returned an empty summary.");
    }

    this.logger.debug(
      "summary_agent.summary.received",
      "SummaryAgent received summary output.",
      {
        taskId: task.taskId,
        runId: task.runId,
        proofId: input.proofId,
        summaryCharSize: summaryText.length,
        modelId: summaryResult.value.modelInfo.modelId,
        gatewayId: summaryResult.value.modelInfo.gatewayId,
        outputRefCount: summaryResult.value.outputRefs.length
      }
    );

    const payload: SummaryProofResult = {
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
    };

    const validation = await ports.call("schema.validate", {
      schemaRef: this.outputSchemaRef,
      value: payload
    });

    if (!validation.ok) {
      return validation;
    }

    const artifact: Artifact<SummaryProofResult> = {
      meta: {
        id: `artifact_${input.proofId}`,
        type: "summary_proof_result",
        schemaVersion: input.schemaVersion,
        createdAt: new Date().toISOString(),
        createdBy: this.agentId,
        runId: task.runId,
        sessionId: task.sessionId,
        taskId: task.taskId,
        validation: payload.validation
      },
      payload
    };

    const artifactWrite = await ports.call("artifact.write", { artifact });

    if (!artifactWrite.ok) {
      return artifactWrite;
    }

    const audit = await ports.call("audit.trace", {
      eventType: "summary_agent.completed",
      refs: [artifact.meta.id, ...inputRefs],
      message: "SummaryAgent completed through ToolPortRegistry."
    });

    if (!audit.ok) {
      return audit;
    }

    void context;

    return ok({ artifact, warnings: [] });
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
