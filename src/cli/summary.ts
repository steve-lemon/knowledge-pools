#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { SummaryAgent, toSummaryProofJson } from "../agents/summary-agent.js";
import { MockLlmGateway, NoopLlmGateway } from "../tools/llm-gateway.js";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmGateway
} from "../tools/openai-llm-gateway.js";
import { StorageSummaryReadTool } from "../tools/summary-read-tool.js";
import { LocalStorage } from "../stores/local-storage.js";

interface CliOptions {
  path?: string;
  rootDir?: string;
  maxInputChars?: number;
  maxSummaryChars?: number;
  gateway: "mock" | "noop" | "openai";
  model?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { gateway: "mock" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--root") {
      options.rootDir = argv[++index];
    } else if (arg === "--max-input-chars") {
      options.maxInputChars = Number(argv[++index]);
    } else if (arg === "--max-summary-chars") {
      options.maxSummaryChars = Number(argv[++index]);
    } else if (arg === "--gateway") {
      const gateway = argv[++index];
      if (gateway !== "mock" && gateway !== "noop" && gateway !== "openai") {
        throw new Error(`Unsupported gateway: ${gateway}`);
      }
      options.gateway = gateway;
    } else if (arg === "--model") {
      options.model = argv[++index];
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (!options.path) {
      options.path = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage:
  npm run dev:summary -- <path> [--root <dir>] [--gateway mock|noop|openai]
  npm run summary -- <path> [--root <dir>] [--gateway mock|noop|openai]

Options:
  --root <dir>              Local storage root. Defaults to current directory.
  --gateway mock|noop|openai
                            LLM gateway adapter. Defaults to mock.
  --model <model>           OpenAI model. Defaults to OPENAI_MODEL or ${DEFAULT_OPENAI_MODEL}.
  --max-input-chars <n>     Truncate input before summary.
  --max-summary-chars <n>   Limit mock summary length.
`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.path) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const storage = new LocalStorage({ rootDir: options.rootDir });
  const readTool = new StorageSummaryReadTool(storage);
  const llmGateway = createGateway(options);

  const agent = new SummaryAgent({ readTool, llmGateway });
  const result = await agent.summarizePath({
    schemaVersion: "summary-agent-prototype/v1",
    proofId: `summary_${randomUUID()}`,
    path: options.path,
    mediaHint: inferMediaHint(options.path),
    maxInputChars: options.maxInputChars,
    maxSummaryChars: options.maxSummaryChars
  });

  if (!result.ok) {
    console.error(JSON.stringify({ ok: false, error: result.error }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify({ ok: true, value: toSummaryProofJson(result.value) }, null, 2)
  );
}

function createGateway(
  options: CliOptions
): MockLlmGateway | NoopLlmGateway | OpenAiLlmGateway {
  if (options.gateway === "noop") {
    return new NoopLlmGateway();
  }

  if (options.gateway === "openai") {
    return new OpenAiLlmGateway({ model: options.model });
  }

  return new MockLlmGateway();
}

function inferMediaHint(path: string): string {
  const lower = path.toLowerCase();

  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".txt")) return "txt";
  return "unknown";
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: {
          code: "unhandled_error",
          message: error instanceof Error ? error.message : String(error),
          retryable: false
        }
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
