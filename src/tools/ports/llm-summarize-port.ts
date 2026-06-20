import { err } from "../../contracts/common.js";
import type { LlmGateway, LlmSummaryRequest } from "../llm-gateway.js";

export function createLlmSummarizePort(llmGateway: LlmGateway) {
  return async (request: LlmSummaryRequest) => {
    const result = await llmGateway.summarize(request);

    if (!result.ok) {
      return err("model_failure", result.error.message, result.error.retryable, {
        cause: result.error
      });
    }

    return result;
  };
}
