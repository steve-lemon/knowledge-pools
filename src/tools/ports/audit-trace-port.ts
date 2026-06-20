import { ok } from "../../contracts/common.js";

export interface AuditTraceRequest {
  eventType: string;
  refs: string[];
  message?: string;
}

export interface AuditTraceResponse {
  traceRef: string;
}

export function createInMemoryAuditTracePort() {
  const traces: Array<AuditTraceRequest & { traceRef: string; createdAt: string }> = [];

  const handler = async (request: AuditTraceRequest) => {
    const traceRef = `trace:audit:${traces.length + 1}`;
    traces.push({ ...request, traceRef, createdAt: new Date().toISOString() });
    return ok({ traceRef });
  };

  return { handler, traces };
}
