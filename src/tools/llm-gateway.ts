import type {
  ContentHash,
  IsoDateTime,
  RefString,
  Result,
  SchemaVersion,
  ValidationSummary
} from "../contracts/common.js";
import { err, ok, passedValidation } from "../contracts/common.js";

export type LlmGatewayId = string;
export type LlmProviderId = string;
export type LlmModelId = string;
export type LlmRequestId = string;

export type LlmSummaryPurpose =
  | "preview"
  | "summaryAgentPrototype"
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
  timeoutMs?: number;
  seed?: number;
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

export interface LlmGateway {
  summarize(request: LlmSummaryRequest): Promise<Result<LlmSummaryResponse>>;
}

export class MockLlmGateway implements LlmGateway {
  async summarize(
    request: LlmSummaryRequest
  ): Promise<Result<LlmSummaryResponse>> {
    const inputText = request.inputText.trim();

    if (!inputText) {
      return err("empty_input", "Cannot summarize empty input.");
    }

    const summaryText = this.buildSummary(inputText, request.maxSummaryChars);

    return ok({
      schemaVersion: request.schemaVersion,
      requestId: request.requestId,
      summaryText,
      outputRefs: request.inputRefs,
      modelInfo: {
        gatewayId: "llm_gateway_mock",
        providerId: "mock",
        modelId: request.modelPolicy?.modelHint ?? "summary_stub_v1",
        adapterVersion: "v1"
      },
      usage: {
        inputTokens: Math.ceil(inputText.length / 4),
        outputTokens: Math.ceil(summaryText.length / 4),
        totalTokens: Math.ceil((inputText.length + summaryText.length) / 4),
        estimated: true
      },
      validation: passedValidation("schema:llm_summary_response:v1"),
      createdAt: new Date().toISOString()
    });
  }

  private buildSummary(inputText: string, maxSummaryChars = 480): string {
    const compact = inputText.replace(/\s+/g, " ");
    const firstSentence = compact.match(/.*?[.!?](\s|$)/)?.[0]?.trim();
    const base = firstSentence && firstSentence.length >= 24 ? firstSentence : compact;

    if (base.length <= maxSummaryChars) {
      return base;
    }

    return `${base.slice(0, Math.max(0, maxSummaryChars - 3)).trimEnd()}...`;
  }
}

export class NoopLlmGateway implements LlmGateway {
  async summarize(): Promise<Result<LlmSummaryResponse>> {
    return err(
      "model_disabled",
      "LLM summary is disabled for this gateway.",
      false
    );
  }
}
