import type {
  ContractError,
  IsoDateTime,
  RefString,
  ValidationIssue,
  ValidationSummary
} from "../contracts/common.js";

export type StageName = "prototype";
export type AgentName = "summary_agent";
export type ArtifactType = "summary_proof_result" | "summary_feasibility_report";

export type AgentStatus =
  | "completed"
  | "completed_with_warnings"
  | "blocked"
  | "failed";

export interface AgentConstraints {
  requireEvidenceRefs?: boolean;
  allowModel?: boolean;
  allowPartialResult?: boolean;
  maxToolCalls?: number;
  [key: string]: unknown;
}

export interface AgentTask<TInput = unknown> {
  taskId: string;
  runId: string;
  sessionId?: string;
  stage: StageName;
  agentId: AgentName;
  intent: string;
  input: TInput;
  contextRefs: RefString[];
  constraints: AgentConstraints;
  allowedToolPorts: string[];
  outputSchemaRef: RefString;
  createdAt: IsoDateTime;
}

export interface ContextEnvelope {
  contextId: string;
  runId: string;
  sessionId?: string;
  taskId: string;
  stage: StageName;
  agentId: AgentName;
  purpose: "task_context";
  artifactRefs: RefString[];
  sourceRefs: RefString[];
  evidenceRefs: RefString[];
  memoryRefs: RefString[];
  taxonomyRefs: RefString[];
  schemaRefs: RefString[];
  constraints: AgentConstraints;
  excludedContext: RefString[];
  createdAt: IsoDateTime;
}

export interface ArtifactMeta {
  id: string;
  type: ArtifactType;
  schemaVersion: string;
  createdAt: IsoDateTime;
  createdBy: AgentName;
  runId: string;
  sessionId?: string;
  taskId: string;
  validation: ValidationSummary;
}

export interface Artifact<TPayload = unknown> {
  meta: ArtifactMeta;
  payload: TPayload;
}

export interface AgentError extends ContractError {}

export interface AgentResult<TOutput = unknown, THandoff = unknown> {
  taskId: string;
  runId: string;
  sessionId?: string;
  stage: StageName;
  agentId: AgentName;
  status: AgentStatus;
  artifact?: Artifact<TOutput>;
  handoff?: THandoff;
  traceRefs: RefString[];
  errors: AgentError[];
  warnings: ValidationIssue[];
}

export interface AgentToolset {
  required: string[];
  optional: string[];
  forbidden: string[];
}
