# Stage Data Flow Contract

This document defines the common data objects that move across Knowledge Pools stages.

Use it with:

- [Context and Session Model](context-session-model.md)
- [Agent Superclass Contract](agent-superclass-contract.md)
- [Agent Connection Model](agent-connection-model.md)
- [Stage Transition Guidelines](../operations/stage-transition-guidelines.md)

## Core Rule

Agents do not pass hidden conversation state to each other.

Every stage transition must pass refs, schemas, validation status, provenance, and traceability through explicit objects.

```text
Session
  -> Run
    -> Task
      -> ContextEnvelope
      -> Agent
      -> Artifact
      -> HandoffEnvelope
      -> next Task
```

## Object Boundaries

| Object | Purpose | Owner | Lifetime | Contains | Must not contain |
| --- | --- | --- | --- | --- | --- |
| `Session` | Continuity boundary for a user or workflow | Orchestrator | Long-lived | goals, summaries, run refs, project refs | raw stage payloads, hidden provider thread state |
| `Run` | One workflow execution | Orchestrator | One workflow | task refs, artifact refs, trace refs, status | durable truth decisions |
| `Task` | One unit of work for one agent | Orchestrator | One agent call | input payload, context refs, tool grants, output schema | unrelated session history |
| `ContextEnvelope` | Bounded context package for a task | Orchestrator | One task | refs, constraints, summaries, evidence refs, excluded context | unbounded raw source dumps, implicit memory |
| `Artifact` | Typed output produced by a stage | Agent through runtime | Run-local or durable by policy | payload, metadata, provenance, validation | next-stage instructions hidden from schema |
| `HandoffEnvelope` | Typed transition contract to the next stage | Agent through runtime, validated by orchestrator | Stage transition | artifact refs, evidence refs, context refs, validation status, stage-specific payload | full source text, unresolved implicit assumptions |
| `TraceEvent` | Audit trail for execution | Runtime/tools | Append-only | tool calls, decisions, refs, timestamps | private provider state as source of truth |

## Responsibility Split

### Session

Session answers:

> What continuity does this work belong to?

Session is for continuity, not payload transfer.

It may keep:

- session summary refs;
- active goal refs;
- open question refs;
- recent run refs;
- durable memory refs.

It must not be used as:

- a substitute for handoff;
- a hidden prompt cache;
- a place to store stage-specific output without schemas.

### Run

Run answers:

> Which workflow execution produced these tasks, artifacts, and traces?

Run is the audit container for one workflow.

It owns:

- run status;
- task refs;
- artifact refs;
- handoff refs;
- trace refs.

Run does not decide whether outputs are durable memory.

### Task

Task answers:

> What exactly should this agent do now?

Task owns:

- stage name;
- agent id;
- intent;
- typed input;
- allowed tool ports;
- output schema ref;
- context refs.

Task should be small enough to validate before the agent starts.

### Context Envelope

Context envelope answers:

> What bounded information may this agent use for this task?

Context is assembled by the orchestrator.

It should contain:

- refs to relevant artifacts;
- refs to relevant source units;
- refs to evidence bundles;
- refs to memory records;
- taxonomy and schema refs;
- constraints;
- short summaries when useful;
- `excluded_context` when something relevant was omitted.

Context must not be treated as the system of record.

If a fact matters, it should be reachable through a ref.

### Artifact

Artifact answers:

> What did this stage produce?

Artifact is the typed output of a stage.

Examples:

- `IngestArtifact`;
- `UnderstandingArtifact`;
- `ConnectionArtifact`;
- `RetrievalPlan`;
- `EvidenceBundle`;
- `DraftAnswer`;
- `VerificationReport`;
- `UpdateCandidate`;
- `CurationDecision`.

Artifact payloads may be detailed, but they must keep provenance and validation metadata.

### Handoff Envelope

Handoff answers:

> What should the next stage receive, and why is it safe to proceed?

Handoff is a transition contract, not a data dump.

It should contain:

- `handoff_id`;
- `handoff_type`;
- `schema_version`;
- `run_id`;
- optional `session_id`;
- `from_stage`;
- `to_stage`;
- producer artifact refs;
- required input refs for the next stage;
- evidence refs when relevant;
- taxonomy and schema refs when relevant;
- validation status;
- quality or validation report refs;
- trace refs.

Handoff must not contain full source text or long generated rationale by default.

Long content should live in artifacts or source units and be referenced.

### Trace Event

Trace answers:

> What happened, through which tool or decision, and which refs were involved?

Trace is for audit and replay.

It should not replace artifacts or handoffs.

## Stage Transition Data Map

| Transition | Required handoff payload | Consumer starts from | Consumer must validate |
| --- | --- | --- | --- |
| `ingest -> understand` | source/version refs, manifest ref, ingest artifact ref, access unit refs, taxonomy refs, parser policy, validation report | `IngestToUnderstandHandoff` | source version, manifest, access units, taxonomy, handoff schema |
| `understand -> connect` | understanding artifact ref, knowledge candidate refs, ambiguity/review refs, quality report, taxonomy refs | `UnderstandToConnectHandoff` | candidates, evidence refs, quality report, taxonomy, handoff schema |
| `connect -> verify` | connection artifact ref, relationship proposal refs, conflict/unresolved refs, quality report, taxonomy refs | `ConnectToVerifyHandoff` | proposal refs, endpoint refs, evidence refs, taxonomy, handoff schema |
| `plan -> retrieve` | retrieval plan ref, evidence requirements, freshness scope, conflict-search flag, retrieval budget | `PlanToRetrieveHandoff` | plan schema, permitted retrieval paths, freshness constraints |
| `retrieve -> reason` | evidence bundle ref, evidence refs, missing evidence, conflict refs | `RetrieveToReasonHandoff` | evidence refs, missing evidence, conflict handling requirements |
| `reason -> verify` | draft answer or proposed action ref, evidence bundle ref, claim refs, assumption refs | `ReasonToVerifyHandoff` | cited evidence, claim refs, assumptions, answer/action schema |
| `verify -> update` | verification report ref, verified/rejected/unsupported/uncertain refs, review refs, update signal refs | `VerifyToUpdateHandoff` | verification status, unsupported refs, review requirements |
| `update -> curation` | update candidate refs, source/evidence refs, review flag | `UpdateToCurationHandoff` | candidate schema, provenance, evidence, duplication/conflict policy |
| `curation -> evaluate` | curation decision refs, accepted/rejected refs | `CurationToEvaluateHandoff` | decision refs, durable write refs, trace completeness |

## Context vs Handoff

Use context when the agent needs bounded information to perform work.

Use handoff when one stage declares what the next stage may consume.

| Question | ContextEnvelope | HandoffEnvelope |
| --- | --- | --- |
| Who creates it? | Orchestrator | Producing stage through runtime |
| Who consumes it? | One agent task | Next stage/orchestrator |
| Main purpose | Bound what the agent can see | Declare what moves forward |
| Contains task instructions? | Yes, through constraints and refs | Only next-stage transition intent |
| Contains validation status? | Optional context metadata | Required |
| Used as audit record? | Reproducibility aid | Stage transition record |

## Session vs Context

Session preserves continuity across runs.

Context is a bounded view for one task.

Do not pass the whole session as context.

Instead:

```text
session records + run artifacts + task input
  -> orchestrator selection
  -> ContextEnvelope
```

## Artifact vs Handoff

Artifact is what a stage produced.

Handoff is what the next stage needs to consume.

One artifact may support multiple handoffs.

One handoff may reference multiple artifacts.

## Validation Rules

A handoff is valid only when:

- the handoff schema validates;
- required refs resolve;
- producer artifact validation passed or passed with warnings;
- quality report ref resolves when required;
- evidence refs resolve or are explicitly listed as missing;
- taxonomy and schema versions are explicit when relevant;
- the producing stage did not exceed its responsibility boundary;
- the next stage has permission to read the referenced artifacts.

The orchestrator must block normal progression when handoff validation fails.

Failed artifacts may still be stored for debugging.

## Minimal V1 Rule

For v1 implementation:

- store `Session`, `Run`, `Task`, `Artifact`, `HandoffEnvelope`, `ContextEnvelope`, and `TraceEvent` as JSON-compatible records;
- pass refs between stages, not full content;
- make every handoff schema-validatable;
- include validation status and trace refs in every handoff;
- let the orchestrator assemble context for each task;
- never use provider-hosted model session state as the source of truth.

## Design Rule

Session is continuity.

Context is bounded working memory.

Artifact is produced output.

Handoff is the typed bridge.

Trace is the audit trail.
