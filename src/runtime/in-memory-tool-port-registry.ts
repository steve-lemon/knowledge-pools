import type { Result } from "../contracts/common.js";
import { err, ok } from "../contracts/common.js";
import type {
  ToolPortHandler,
  ToolPortRegistry
} from "./tool-port-registry.js";

export interface ToolTraceRecord {
  traceRef: string;
  portId: string;
  status: "completed" | "failed";
  createdAt: string;
}

export class InMemoryToolPortRegistry implements ToolPortRegistry {
  private readonly handlers = new Map<string, ToolPortHandler>();
  private readonly traces: ToolTraceRecord[] = [];

  constructor(private readonly allowedPorts: string[]) {}

  register<TRequest, TResponse>(
    portId: string,
    handler: ToolPortHandler<TRequest, TResponse>
  ): void {
    this.handlers.set(portId, handler as ToolPortHandler);
  }

  async call<TRequest = unknown, TResponse = unknown>(
    portId: string,
    request: TRequest
  ): Promise<Result<TResponse>> {
    if (!this.allowedPorts.includes(portId)) {
      const result = err(
        "tool_permission_denied",
        `Tool port is not allowed: ${portId}.`
      );
      this.recordTrace(portId, "failed");
      return result;
    }

    const handler = this.handlers.get(portId);

    if (!handler) {
      const result = err(
        "tool_not_registered",
        `Tool port not registered: ${portId}.`
      );
      this.recordTrace(portId, "failed");
      return result;
    }

    try {
      const result = (await handler(request)) as Result<TResponse>;
      this.recordTrace(portId, result.ok ? "completed" : "failed");
      return result;
    } catch (error) {
      this.recordTrace(portId, "failed");
      return err(
        "tool_failure",
        error instanceof Error ? error.message : String(error),
        false
      );
    }
  }

  getTraceRefs(): string[] {
    return this.traces.map((trace) => trace.traceRef);
  }

  getTraces(): ToolTraceRecord[] {
    return [...this.traces];
  }

  private recordTrace(portId: string, status: ToolTraceRecord["status"]): void {
    this.traces.push({
      traceRef: `trace:${portId}:${this.traces.length + 1}`,
      portId,
      status,
      createdAt: new Date().toISOString()
    });
  }
}
