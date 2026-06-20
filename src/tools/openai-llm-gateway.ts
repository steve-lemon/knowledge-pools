import type { Result } from "../contracts/common.js";
import { err, ok, passedValidation } from "../contracts/common.js";
import type {
  LlmGateway,
  LlmModelInfo,
  LlmSummaryRequest,
  LlmSummaryResponse
} from "./llm-gateway.js";

export const DEFAULT_OPENAI_MODEL = "gpt-5.5-mini";

export interface OpenAiLlmGatewayOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

interface OpenAiResponseBody {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export class OpenAiLlmGateway implements LlmGateway {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: OpenAiLlmGatewayOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for OpenAiLlmGateway.");
    }

    this.apiKey = apiKey;
    this.model =
      options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  async summarize(
    request: LlmSummaryRequest
  ): Promise<Result<LlmSummaryResponse>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: request.modelPolicy?.modelHint ?? this.model,
          input: this.buildPrompt(request)
        })
      });

      const body = (await response.json()) as OpenAiResponseBody;

      if (!response.ok) {
        return err(
          body.error?.code ?? "openai_response_failed",
          body.error?.message ?? `OpenAI request failed with ${response.status}.`,
          response.status >= 500,
          { status: response.status, errorType: body.error?.type }
        );
      }

      const summaryText = this.extractText(body).trim();

      if (!summaryText) {
        return err("empty_openai_summary", "OpenAI returned an empty summary.");
      }

      const modelInfo: LlmModelInfo = {
        gatewayId: "llm_gateway_openai",
        providerId: "openai",
        modelId: request.modelPolicy?.modelHint ?? this.model,
        adapterVersion: "responses_api_v1"
      };

      return ok({
        schemaVersion: request.schemaVersion,
        requestId: request.requestId,
        summaryText,
        outputRefs: request.inputRefs,
        modelInfo,
        usage: body.usage
          ? {
              inputTokens: body.usage.input_tokens,
              outputTokens: body.usage.output_tokens,
              totalTokens: body.usage.total_tokens,
              estimated: false
            }
          : undefined,
        validation: passedValidation("schema:llm_summary_response:v1"),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      return err(
        isAbort ? "openai_timeout" : "openai_request_error",
        error instanceof Error ? error.message : String(error),
        true
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildPrompt(request: LlmSummaryRequest): string {
    const maxChars = request.maxSummaryChars ?? 800;
    const language = request.languageHint
      ? `Write the summary in ${request.languageHint}.`
      : "Preserve the source language when possible.";

    return [
      "Summarize the following source text for the Knowledge Pools SummaryAgent prototype.",
      "Do not add claims that are not supported by the input.",
      `Keep the summary under ${maxChars} characters.`,
      language,
      "",
      "Source text:",
      request.inputText
    ].join("\n");
  }

  private extractText(body: OpenAiResponseBody): string {
    if (typeof body.output_text === "string") {
      return body.output_text;
    }

    const chunks: string[] = [];

    for (const item of body.output ?? []) {
      for (const content of item.content ?? []) {
        if (content.type === "output_text" && content.text) {
          chunks.push(content.text);
        }
      }
    }

    return chunks.join("\n");
  }
}
