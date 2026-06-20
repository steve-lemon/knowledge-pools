#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import {
  EvaluationAgent,
  toEvaluationReportJson
} from "../agents/evaluation-agent.js";
import { SummaryAgent, toSummaryProofJson } from "../agents/summary-agent.js";
import type {
  SummarizePathInput,
  SummaryProofResult
} from "../agents/summary-agent.js";
import type { AgentResult } from "../runtime/agent-contracts.js";
import { InMemoryToolPortRegistry } from "../runtime/in-memory-tool-port-registry.js";
import type { LogLevel, Logger } from "../runtime/logger.js";
import { ConsoleLogger, noopLogger } from "../runtime/logger.js";
import { PrototypeRuntimeOrchestrator } from "../runtime/prototype-runtime-orchestrator.js";
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
  evaluate: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    gateway: "mock",
    logLevel: "info",
    quiet: false,
    evaluate: false
  };

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
    } else if (arg === "--evaluate") {
      options.evaluate = true;
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
  --evaluate                Run a sample EvaluationAgent over the SummaryAgent result.

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
  const evaluationAgent = new EvaluationAgent(logger);
  const orchestrator = new PrototypeRuntimeOrchestrator();
  const input: SummarizePathInput = {
    schemaVersion: "summary-agent-prototype/v1",
    proofId: `summary_${randomUUID()}`,
    path: options.path,
    mediaHint: inferMediaHint(options.path),
    maxInputChars: options.maxInputChars,
    maxSummaryChars: options.maxSummaryChars
  };
  const task = orchestrator.createTask(input, agent, {
    intent: "summarize_path",
    constraints: {
      allowModel: true,
      maxToolCalls: 8
    }
  });
  const context = orchestrator.createContext(task);
  const ports = new InMemoryToolPortRegistry(task.allowedToolPorts, logger);
  const artifactPort = createInMemoryArtifactWritePort();
  const auditPort = createInMemoryAuditTracePort();

  ports.register("summary.read", createSummaryReadPort(readTool));
  ports.register("llm.summarize", createLlmSummarizePort(llmGateway));
  ports.register("schema.validate", createSchemaValidatePort());
  ports.register("artifact.write", artifactPort.handler);
  ports.register("audit.trace", auditPort.handler);

  const dispatch = await orchestrator.dispatch(task, context, agent, ports);

  if (!dispatch.ok) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: dispatch.error,
          orchestrator: {
            task_id: task.taskId,
            run_id: task.runId,
            stage: task.stage,
            agent_id: task.agentId
          }
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  const result = dispatch.value.result;

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

  const evaluation = options.evaluate
    ? await runEvaluation(orchestrator, evaluationAgent, result, logger)
    : undefined;

  if (evaluation && !evaluation.ok) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          errors: evaluation.errors,
          summary_agent_result: {
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
        },
        evaluation: evaluation?.value
      },
      null,
      2
    )
  );
}

async function runEvaluation(
  orchestrator: PrototypeRuntimeOrchestrator,
  agent: EvaluationAgent,
  summaryResult: AgentResult<SummaryProofResult>,
  logger: Logger
): Promise<
  | { ok: true; value: unknown }
  | { ok: false; errors: unknown[] }
> {
  const evaluationInput = {
    schemaVersion: "evaluation-agent-prototype/v1",
    evaluationId: `evaluation_${randomUUID()}`,
    summaryAgentResult: summaryResult
  };
  const evaluationTask = orchestrator.createTask(evaluationInput, agent, {
    intent: "evaluate_summary_run",
    constraints: {
      allowModel: false,
      maxToolCalls: 4
    }
  });
  const evaluationContext = orchestrator.createContext(evaluationTask);
  const evaluationPorts = new InMemoryToolPortRegistry(
    evaluationTask.allowedToolPorts,
    logger
  );
  const evaluationArtifactPort = createInMemoryArtifactWritePort();
  const evaluationAuditPort = createInMemoryAuditTracePort();

  evaluationPorts.register("schema.validate", createSchemaValidatePort());
  evaluationPorts.register("artifact.write", evaluationArtifactPort.handler);
  evaluationPorts.register("audit.trace", evaluationAuditPort.handler);

  const evaluationDispatch = await orchestrator.dispatch(
    evaluationTask,
    evaluationContext,
    agent,
    evaluationPorts
  );

  if (!evaluationDispatch.ok) {
    return { ok: false, errors: [evaluationDispatch.error] };
  }

  const evaluationResult = evaluationDispatch.value.result;

  if (evaluationResult.status === "failed" || !evaluationResult.artifact) {
    return { ok: false, errors: evaluationResult.errors };
  }

  return {
    ok: true,
    value: {
      value: toEvaluationReportJson(evaluationResult.artifact.payload),
      agent_result: {
        task_id: evaluationResult.taskId,
        run_id: evaluationResult.runId,
        stage: evaluationResult.stage,
        agent_id: evaluationResult.agentId,
        status: evaluationResult.status,
        artifact_id: evaluationResult.artifact.meta.id,
        trace_refs: evaluationResult.traceRefs
      }
    }
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
