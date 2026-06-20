import { performance } from "node:perf_hooks";
import type { Result } from "../contracts/common.js";
import { err } from "../contracts/common.js";
import type { Logger } from "./logger.js";
import { noopLogger } from "./logger.js";
import type {
  ToolPortHandler,
  ToolPortRegistry
} from "./tool-port-registry.js";

export interface ToolTraceRecord {
  traceRef: string;
  portId: string;
  status: "completed" | "failed";
  createdAt: string;
  durationMs: number;
}

export class InMemoryToolPortRegistry implements ToolPortRegistry {
  private readonly handlers = new Map<string, ToolPortHandler>();
  private readonly traces: ToolTraceRecord[] = [];

  constructor(
    private readonly allowedPorts: string[],
    private readonly logger: Logger = noopLogger
  ) {}

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
    const startedAt = performance.now();

    this.logger.debug("tool.call.started", "Tool port call started.", {
      portId,
      allowed: this.allowedPorts.includes(portId),
      ...describeRequest(request)
    });

    if (!this.allowedPorts.includes(portId)) {
      const result = err(
        "tool_permission_denied",
        `Tool port is not allowed: ${portId}.`
      );
      const traceRef = this.recordTrace(portId, "failed", startedAt);
      this.logger.warn("tool.call.failed", "Tool port is not allowed.", {
        portId,
        traceRef,
        status: "failed",
        errorCode: "tool_permission_denied",
        durationMs: elapsedMs(startedAt)
      });
      return result;
    }

    const handler = this.handlers.get(portId);

    if (!handler) {
      const result = err(
        "tool_not_registered",
        `Tool port not registered: ${portId}.`
      );
      const traceRef = this.recordTrace(portId, "failed", startedAt);
      this.logger.error("tool.call.failed", "Tool port is not registered.", {
        portId,
        traceRef,
        status: "failed",
        errorCode: "tool_not_registered",
        durationMs: elapsedMs(startedAt)
      });
      return result;
    }

    try {
      const result = (await handler(request)) as Result<TResponse>;
      const status = result.ok ? "completed" : "failed";
      const traceRef = this.recordTrace(portId, status, startedAt);

      if (result.ok) {
        this.logger.debug("tool.call.completed", "Tool port call completed.", {
          portId,
          traceRef,
          status,
          durationMs: elapsedMs(startedAt)
        });
      } else {
        this.logger.warn("tool.call.failed", "Tool port call returned error.", {
          portId,
          traceRef,
          status,
          errorCode: result.error.code,
          durationMs: elapsedMs(startedAt)
        });
      }

      return result;
    } catch (error) {
      const result = err(
        "tool_failure",
        error instanceof Error ? error.message : String(error),
        false
      );
      const traceRef = this.recordTrace(portId, "failed", startedAt);
      this.logger.error("tool.call.failed", "Tool port call threw.", {
        portId,
        traceRef,
        status: "failed",
        errorCode: "tool_failure",
        durationMs: elapsedMs(startedAt)
      });
      return result;
    }
  }

  getTraceRefs(): string[] {
    return this.traces.map((trace) => trace.traceRef);
  }

  getTraces(): ToolTraceRecord[] {
    return [...this.traces];
  }

  private recordTrace(
    portId: string,
    status: ToolTraceRecord["status"],
    startedAt: number
  ): string {
    const traceRef = `trace:${portId}:${this.traces.length + 1}`;

    this.traces.push({
      traceRef,
      portId,
      status,
      createdAt: new Date().toISOString(),
      durationMs: elapsedMs(startedAt)
    });

    return traceRef;
  }
}

function describeRequest(request: unknown): Record<string, unknown> {
  if (!request || typeof request !== "object") {
    return { requestType: typeof request };
  }

  return {
    requestType: "object",
    requestKeys: Object.keys(request as Record<string, unknown>)
  };
}

function elapsedMs(startedAt: number): number {
  return Math.round((performance.now() - startedAt) * 1000) / 1000;
}
