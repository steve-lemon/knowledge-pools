import { err, ok } from "../../contracts/common.js";
import type { SummaryReadTool } from "../summary-read-tool.js";
import type {
  SummaryReadRequest,
  SummaryReadResult
} from "../summary-read-tool.js";

export function createSummaryReadPort(readTool: SummaryReadTool) {
  return async (request: SummaryReadRequest) => {
    try {
      return ok(await readTool.read(request));
    } catch (error) {
      return err("summary_read_failed", `Failed to read path: ${request.path}.`, false, {
        cause: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

export type SummaryReadPortResponse = SummaryReadResult;
