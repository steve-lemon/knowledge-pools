import type { Result } from "../contracts/common.js";

export interface ToolPortRegistry {
  call<TRequest = unknown, TResponse = unknown>(
    portId: string,
    request: TRequest
  ): Promise<Result<TResponse>>;

  getTraceRefs(): string[];
}

export type ToolPortHandler<TRequest = unknown, TResponse = unknown> = (
  request: TRequest
) => Promise<Result<TResponse>> | Result<TResponse>;
