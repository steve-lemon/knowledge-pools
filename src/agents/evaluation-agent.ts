import { ok, passedValidation } from "../contracts/common.js";
import type {
  IsoDateTime,
  RefString,
  Result,
  SchemaVersion,
  ValidationIssue,
  ValidationSummary
} from "../contracts/common.js";
import { BaseAgent } from "../runtime/base-agent.js";
import type {
  AgentResult,
  AgentTask,
  AgentToolset,
  Artifact,
  ContextEnvelope
} from "../runtime/agent-contracts.js";
import type { ToolPortRegistry } from "../runtime/tool-port-registry.js";
import type { SummaryProofResult } from "./summary-agent.js";

export type EvaluationReportStatus = "clean" | "issues_found";
export type EvaluationSignalSeverity = "info" | "warning" | "error";

export interface EvaluateSummaryRunInput {
  schemaVersion: SchemaVersion;
  evaluationId: string;
  summaryAgentResult: AgentResult<SummaryProofResult>;
  requiredTracePorts?: string[];
  createdAt?: IsoDateTime;
}

export interface EvaluationSignal {
  signalId: string;
  signalType:
    | "clean_run"
    | "missing_summary_artifact"
    | "missing_execution_snapshot"
    | "missing_trace"
    | "summary_validation_warning"
    | "summary_agent_failed";
  severity: EvaluationSignalSeverity;
  summary: string;
  relatedRefs: RefString[];
}

export interface EvaluationReport {
  schemaVersion: SchemaVersion;
  evaluationId: string;
  evaluatedRunId: string;
  evaluatedTaskId: string;
  evaluatedAgentId: string;
  status: EvaluationReportStatus;
  checkedTraceRefs: RefString[];
  checkedArtifactRefs: RefString[];
  signals: EvaluationSignal[];
  metrics: {
    signalCount: number;
    warningCount: number;
    errorCount: number;
    checkedTraceCount: number;
  };
  recommendedFollowups: string[];
  validation: ValidationSummary;
  createdAt: IsoDateTime;
}

export class EvaluationAgent extends BaseAgent<
  EvaluateSummaryRunInput,
  EvaluationReport
> {
  readonly stage = "prototype" as const;
  readonly agentId = "evaluation_agent" as const;
  readonly outputSchemaRef = "schema:evaluation_report:v1";
  readonly tools: AgentToolset = {
    required: ["schema.validate", "artifact.write", "audit.trace"],
    optional: ["artifact.read"],
    forbidden: [
      "summary.read",
      "llm.summarize",
      "source.read",
      "source.write",
      "source.version",
      "index.search",
      "index.write_projection",
      "retrieval.fetch_evidence",
      "verification.check",
      "candidate.emit",
      "memory.write",
      "curation.decide"
    ]
  };

  protected async execute(
    task: AgentTask<EvaluateSummaryRunInput>,
    context: ContextEnvelope,
    ports: ToolPortRegistry
  ): Promise<Result<{ artifact: Artifact<EvaluationReport>; warnings: ValidationIssue[] }>> {
    const report = this.createReport(task.input);
    const validation = await ports.call("schema.validate", {
      schemaRef: this.outputSchemaRef,
      value: report
    });

    if (!validation.ok) {
      return validation;
    }

    const artifact: Artifact<EvaluationReport> = {
      meta: {
        id: `artifact_${task.input.evaluationId}`,
        type: "evaluation_report",
        schemaVersion: task.input.schemaVersion,
        createdAt: new Date().toISOString(),
        createdBy: this.agentId,
        runId: task.runId,
        sessionId: task.sessionId,
        taskId: task.taskId,
        validation: report.validation
      },
      payload: report
    };

    const artifactWrite = await ports.call("artifact.write", { artifact });

    if (!artifactWrite.ok) {
      return artifactWrite;
    }

    const audit = await ports.call("audit.trace", {
      eventType: "evaluation_agent.completed",
      refs: [
        artifact.meta.id,
        ...report.checkedArtifactRefs,
        ...report.checkedTraceRefs
      ],
      message: "EvaluationAgent inspected SummaryAgent prototype output."
    });

    if (!audit.ok) {
      return audit;
    }

    void context;

    return ok({
      artifact,
      warnings: this.toWarnings(report.signals)
    });
  }

  private createReport(input: EvaluateSummaryRunInput): EvaluationReport {
    const result = input.summaryAgentResult;
    const artifactRef = result.artifact
      ? `artifact:${result.artifact.meta.id}`
      : undefined;
    const requiredTracePorts = input.requiredTracePorts ?? [
      "summary.read",
      "llm.summarize",
      "schema.validate",
      "artifact.write",
      "audit.trace"
    ];
    const missingPorts = requiredTracePorts.filter(
      (portId) =>
        !result.traceRefs.some((traceRef) => traceRef.startsWith(`trace:${portId}:`))
    );
    const signals: EvaluationSignal[] = [];

    if (result.status === "failed") {
      signals.push({
        signalId: `${input.evaluationId}_summary_failed`,
        signalType: "summary_agent_failed",
        severity: "error",
        summary: "SummaryAgent failed before producing an evaluation-ready result.",
        relatedRefs: [result.taskId, result.runId]
      });
    }

    if (!result.artifact) {
      signals.push({
        signalId: `${input.evaluationId}_missing_artifact`,
        signalType: "missing_summary_artifact",
        severity: "error",
        summary: "SummaryAgent result did not include an artifact.",
        relatedRefs: [result.taskId, result.runId]
      });
    }

    if (!result.executionSnapshot) {
      signals.push({
        signalId: `${input.evaluationId}_missing_execution_snapshot`,
        signalType: "missing_execution_snapshot",
        severity: "warning",
        summary: "SummaryAgent result did not include an execution snapshot.",
        relatedRefs: [result.taskId, result.runId]
      });
    }

    for (const portId of missingPorts) {
      signals.push({
        signalId: `${input.evaluationId}_missing_${portId.replace(/\W/g, "_")}`,
        signalType: "missing_trace",
        severity: "warning",
        summary: `Expected trace for ${portId} was not present.`,
        relatedRefs: [result.taskId, result.runId]
      });
    }

    if (result.artifact?.meta.validation.status !== "passed") {
      signals.push({
        signalId: `${input.evaluationId}_validation_warning`,
        signalType: "summary_validation_warning",
        severity: "warning",
        summary: "SummaryAgent artifact validation was not passed.",
        relatedRefs: artifactRef ? [artifactRef] : [result.taskId]
      });
    }

    if (signals.length === 0) {
      signals.push({
        signalId: `${input.evaluationId}_clean`,
        signalType: "clean_run",
        severity: "info",
        summary: "SummaryAgent prototype run produced artifact, validation, and expected traces.",
        relatedRefs: artifactRef ? [artifactRef, ...result.traceRefs] : result.traceRefs
      });
    }

    const warningCount = signals.filter((signal) => signal.severity === "warning").length;
    const errorCount = signals.filter((signal) => signal.severity === "error").length;

    return {
      schemaVersion: input.schemaVersion,
      evaluationId: input.evaluationId,
      evaluatedRunId: result.runId,
      evaluatedTaskId: result.taskId,
      evaluatedAgentId: result.agentId,
      status: warningCount || errorCount ? "issues_found" : "clean",
      checkedTraceRefs: result.traceRefs,
      checkedArtifactRefs: artifactRef ? [artifactRef] : [],
      signals,
      metrics: {
        signalCount: signals.length,
        warningCount,
        errorCount,
        checkedTraceCount: result.traceRefs.length
      },
      recommendedFollowups:
        warningCount || errorCount
          ? ["Inspect SummaryAgent traces before using this run as a regression fixture."]
          : [],
      validation: passedValidation(this.outputSchemaRef),
      createdAt: input.createdAt ?? new Date().toISOString()
    };
  }

  private toWarnings(signals: EvaluationSignal[]): ValidationIssue[] {
    return signals
      .filter((signal) => signal.severity !== "info")
      .map((signal) => ({
        code: signal.signalType,
        message: signal.summary,
        ref: signal.relatedRefs[0]
      }));
  }
}

export function toEvaluationReportJson(report: EvaluationReport): unknown {
  return {
    schema_version: report.schemaVersion,
    evaluation_id: report.evaluationId,
    evaluated_run_id: report.evaluatedRunId,
    evaluated_task_id: report.evaluatedTaskId,
    evaluated_agent_id: report.evaluatedAgentId,
    status: report.status,
    checked_trace_refs: report.checkedTraceRefs,
    checked_artifact_refs: report.checkedArtifactRefs,
    signals: report.signals.map((signal) => ({
      signal_id: signal.signalId,
      signal_type: signal.signalType,
      severity: signal.severity,
      summary: signal.summary,
      related_refs: signal.relatedRefs
    })),
    metrics: {
      signal_count: report.metrics.signalCount,
      warning_count: report.metrics.warningCount,
      error_count: report.metrics.errorCount,
      checked_trace_count: report.metrics.checkedTraceCount
    },
    recommended_followups: report.recommendedFollowups,
    validation: {
      status: report.validation.status,
      schema_ref: report.validation.schemaRef,
      checked_at: report.validation.checkedAt,
      errors: report.validation.errors,
      warnings: report.validation.warnings
    },
    created_at: report.createdAt
  };
}
