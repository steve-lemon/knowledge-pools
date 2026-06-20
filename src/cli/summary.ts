#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { SummaryAgent, toSummaryProofJson } from "../agents/summary-agent.js";
import type { SummarizePathInput } from "../agents/summary-agent.js";
import type { ContextEnvelope, AgentTask } from "../runtime/agent-contracts.js";
import { InMemoryToolPortRegistry } from "../runtime/in-memory-tool-port-registry.js";
import type { LogLevel, Logger } from "../runtime/logger.js";
import { ConsoleLogger, noopLogger } from "../runtime/logger.js";
import { MockLlmGateway, NoopLlmGateway } from "../tools/llm-gateway.js";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmGateway
} from "../tools/openai-llm-gateway.js";
import { createInMemoryArtifactWritePort } from "../tools/ports/artifact-write-port.js";
import { createInMemoryAuditTracePort } from "../tools/ports/audit-trace-port.js";
import { createLlmSummarizePort } from "../tools/ports/llm-summarize-port.js";
import { createSchemaValidatePort } from "../tools/ports/schema-validate-port.js";
import { createSummaryReadPort } from "../tools/ports/summary-read-port.js";
import { StorageSummaryReadTool } from "../tools/summary-read-tool.js";
import { LocalStorage } from "../stores/local-storage.js";

interface CliOptions {
  path?: string;
  rootDir?: string;
  maxInputChars?: number;
  maxSummaryChars?: number;
  gateway: "mock" | "noop" | "openai";
  model?: string;
  logLevel: LogLevel;
  quiet: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { gateway: "mock", logLevel: "info", quiet: false };

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
    } else if (arg === "--log-level") {
      options.logLevel = parseLogLevel(argv[++index]);
    } else if (arg === "--quiet") {
      options.quiet = true;
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
  --model <model>           OpenAI-only model. Defaults to OPENAI_MODEL or ${DEFAULT_OPENAI_MODEL}.
  --max-input-chars <n>     Truncate input before summary.
  --max-summary-chars <n>   Limit mock summary length.
  --log-level <level>       debug|info|warn|error. Defaults to info.
  --quiet                   Disable execution verification logs.

Logs are written to stderr as inline lines. Result payload stays on stdout.
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
  const logger = createLogger(options);
  warnIfModelIsIgnored(options, logger);
  const llmGateway = createGateway(options);
  const agent = new SummaryAgent(logger);
  const input: SummarizePathInput = {
    schemaVersion: "summary-agent-prototype/v1",
    proofId: `summary_${randomUUID()}`,
    path: options.path,
    mediaHint: inferMediaHint(options.path),
    maxInputChars: options.maxInputChars,
    maxSummaryChars: options.maxSummaryChars
  };
  const task = createTask(input, agent);
  const context = createContext(task);
  const ports = new InMemoryToolPortRegistry(task.allowedToolPorts, logger);
  const artifactPort = createInMemoryArtifactWritePort();
  const auditPort = createInMemoryAuditTracePort();

  ports.register("summary.read", createSummaryReadPort(readTool));
  ports.register("llm.summarize", createLlmSummarizePort(llmGateway));
  ports.register("schema.validate", createSchemaValidatePort());
  ports.register("artifact.write", artifactPort.handler);
  ports.register("audit.trace", auditPort.handler);

  const result = await agent.run(task, context, ports);

  if (result.status === "failed" || !result.artifact) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          errors: result.errors,
          agent_result: {
            task_id: result.taskId,
            run_id: result.runId,
            stage: result.stage,
            agent_id: result.agentId,
            status: result.status,
            trace_refs: result.traceRefs
          }
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        value: toSummaryProofJson(result.artifact.payload),
        agent_result: {
          task_id: result.taskId,
          run_id: result.runId,
          stage: result.stage,
          agent_id: result.agentId,
          status: result.status,
          artifact_id: result.artifact.meta.id,
          trace_refs: result.traceRefs
        }
      },
      null,
      2
    )
  );
}

function createTask(
  input: SummarizePathInput,
  agent: SummaryAgent
): AgentTask<SummarizePathInput> {
  const runId = `run_${randomUUID()}`;
  const taskId = `task_${randomUUID()}`;

  return {
    taskId,
    runId,
    stage: agent.stage,
    agentId: agent.agentId,
    intent: "summarize_path",
    input,
    contextRefs: [],
    constraints: {
      allowModel: true,
      maxToolCalls: 8
    },
    allowedToolPorts: [...agent.tools.required, ...agent.tools.optional],
    outputSchemaRef: agent.outputSchemaRef,
    createdAt: new Date().toISOString()
  };
}

function createContext(task: AgentTask<SummarizePathInput>): ContextEnvelope {
  return {
    contextId: `context_${randomUUID()}`,
    runId: task.runId,
    sessionId: task.sessionId,
    taskId: task.taskId,
    stage: task.stage,
    agentId: task.agentId,
    purpose: "task_context",
    artifactRefs: [],
    sourceRefs: [],
    evidenceRefs: [],
    memoryRefs: [],
    taxonomyRefs: [],
    schemaRefs: [task.outputSchemaRef],
    constraints: task.constraints,
    excludedContext: [],
    createdAt: new Date().toISOString()
  };
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

function createLogger(options: CliOptions): Logger {
  if (options.quiet) {
    return noopLogger;
  }

  return new ConsoleLogger(options.logLevel);
}

function warnIfModelIsIgnored(options: CliOptions, logger: Logger): void {
  if (options.model && options.gateway !== "openai") {
    logger.warn("cli.option.ignored", "Model option is ignored by this gateway.", {
      gateway: options.gateway,
      ignoredOption: "model",
      requestedModel: options.model
    });
  }
}

function parseLogLevel(value: string | undefined): LogLevel {
  if (
    value === "debug" ||
    value === "info" ||
    value === "warn" ||
    value === "error"
  ) {
    return value;
  }

  throw new Error(`Unsupported log level: ${value}`);
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
