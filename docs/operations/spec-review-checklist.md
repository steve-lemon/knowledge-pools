# Specification Review Checklist

Use this checklist while preparing implementation-near specifications.

The goal is to move one item at a time from architecture intent to implementation-ready contracts.

Do not mark an item complete until the relevant spec includes interfaces, types, validation rules, failure behavior, and acceptance criteria.

## Progress Rule

Each checklist item should end in one of these states:

- unchecked: not reviewed yet;
- checked: reviewed and documented enough for the next dependent spec;
- linked note: checked item should point to the spec or document that completed it when useful.

When a detailed spec is created under `docs/specs/`, update this checklist in the same change.

## Priority Rule

Use priorities to keep Markdown-first validation small.

| Priority | Meaning | Work timing |
| --- | --- | --- |
| P0 | Required to specify the immediate Markdown-first validation path | Do now |
| P1 | Required to complete the first full Markdown-first loop specification | Do after P0 |
| P2 | Required for lifecycle, governance, regression, and implementation readiness | Do after the first loop is coherent |
| P3 | Required for media expansion, external infrastructure, and scale | Defer until Markdown-first is stable |

Do not start P1 work when a P0 contract is still ambiguous.

Do not start P3 work to solve a P0 problem.

## Markdown-First Priority Map

| Priority | Focus | Checklist sections |
| --- | --- | --- |
| P0 | Stable common contracts, local refs, Markdown source storage, minimum tool ports, and validation basics | 1, 2, 4, 7, 8, 9 |
| P1 | CLI contracts, runtime orchestration, ingest/understand/connect/retrieve/reason/verify loop | 3, 5, 6, 7, 8, 9 |
| P2 | update, curation, evaluate, lifecycle, regression readiness, runtime-code readiness | 6, 7, 9, 10 |
| P3 | image, PDF, audio, video, real OpenSearch, graph/vector stores, distributed or multi-repo behavior | deferred media and infrastructure specs |

## Review Order

Follow this order unless a later item is blocking an earlier one.

1. Shared contracts and IDs.
2. Local store layout.
3. CLI command contracts.
4. Tool port contracts.
5. Runtime and orchestrator contracts.
6. Agent specs by stage.
7. Stage artifact and handoff payloads.
8. Fixtures and validation harness.
9. Readiness review before runtime code.

## 1. Shared Contracts And IDs

Priority: P0.

Reason: every Markdown-first artifact, handoff, source unit, trace, and fixture depends on stable IDs and refs.

- [ ] Define ID families: source, version, access unit, artifact, handoff, run, session, task, trace, candidate, relation, evidence, lifecycle.
- [ ] Define stable ref string format and parsing rules.
- [ ] Define hash and version policy for source updates.
- [ ] Define common timestamp, schema version, and status conventions.
- [ ] Define common `Result` and typed error shapes.
- [ ] Define provenance object fields and required provenance levels.
- [ ] Define validation summary shape.
- [ ] Define TypeScript type export structure.
- [ ] Define JSON compatibility rules for all contracts.
- [ ] Define migration/versioning policy for contract changes.

Completion artifact target:

- `docs/specs/contracts/common-contracts.md`

## 2. Local Store Layout

Priority: P0.

Reason: Markdown-first validation needs a concrete local place for sources, versions, manifests, artifacts, traces, projections, and fixtures before command behavior can be specified.

- [ ] Define local data root and configurable path behavior.
- [ ] Define source storage layout.
- [ ] Define source version layout.
- [ ] Define manifest storage layout.
- [ ] Define artifact storage layout by stage.
- [ ] Define run/session/task storage layout.
- [ ] Define append-only trace storage layout.
- [ ] Define taxonomy bundle storage layout.
- [ ] Define OpenSearch-compatible local projection storage layout.
- [ ] Define fixture and expected-output storage layout.
- [ ] Define read/write/overwrite policy for each store.
- [ ] Define cleanup, quarantine, tombstone, and restore behavior where relevant.

Completion artifact target:

- `docs/specs/stores/local-store-layout.md`

## 3. CLI Command Contracts

Priority: P1.

Reason: command contracts should be specified after the shared contracts, local store layout, and minimum tool ports are stable.

- [ ] Define global CLI options and config discovery.
- [ ] Define common command output format.
- [ ] Define exit code policy.
- [ ] Define `kp ingest <path>`.
- [ ] Define `kp understand <run-id>`.
- [ ] Define `kp connect <run-id>`.
- [ ] Define `kp plan "<question>"`.
- [ ] Define `kp retrieve <plan-id>`.
- [ ] Define `kp ask "<question>"`.
- [ ] Define `kp verify <run-id>`.
- [ ] Define `kp update <run-id>`.
- [ ] Define `kp curate <candidate-id>`.
- [ ] Define `kp evaluate <run-id>`.
- [ ] Define dry-run, verbose, JSON output, and trace output behavior.

Completion artifact target:

- `docs/specs/commands/cli-command-contracts.md`

## 4. Tool Port Contracts

Priority: P0 for required Markdown ports, P1 for orchestration ports, P2 for lifecycle ports, P3 for media and external infrastructure ports.

Reason: agents must depend on provider-independent tools, but only the Markdown-first ports should be locked immediately.

P0 tool ports:

- `source.locate`
- `source.read`
- `source.write`
- `source.version`
- `parse.document`
- `chunk.create`
- `schema.validate`
- `artifact.read`
- `artifact.write`
- `audit.trace`

P1 tool ports:

- `index.write_projection`
- `index.search`
- `retrieval.plan`
- `retrieval.fetch_evidence`
- `verification.check`

P2 tool ports:

- `taxonomy.read`
- `taxonomy.validate`
- `preview.create`

P3 tool ports:

- optional `model.complete`
- media parsing tools
- external infrastructure adapters

- [ ] Define common tool request and response envelope.
- [ ] Define common tool error shape.
- [ ] Define tool side effect levels.
- [ ] Define tool trace requirements.
- [ ] Define `source.locate`.
- [ ] Define `source.read`.
- [ ] Define `source.write`.
- [ ] Define `source.version`.
- [ ] Define `parse.document`.
- [ ] Define `chunk.create`.
- [ ] Define `preview.create`.
- [ ] Define `taxonomy.read`.
- [ ] Define `taxonomy.validate`.
- [ ] Define `schema.validate`.
- [ ] Define `artifact.read`.
- [ ] Define `artifact.write`.
- [ ] Define `index.write_projection`.
- [ ] Define `index.search`.
- [ ] Define `retrieval.plan`.
- [ ] Define `retrieval.fetch_evidence`.
- [ ] Define `verification.check`.
- [ ] Define `audit.trace`.
- [ ] Define optional `model.complete` adapter boundary.

Completion artifact target:

- `docs/specs/tools/tool-port-contracts.md`

## 5. Runtime And Orchestrator Contracts

Priority: P1.

Reason: runtime orchestration should be defined once P0 object and tool boundaries are known.

- [ ] Define runtime module responsibilities.
- [ ] Define orchestrator entry points.
- [ ] Define session creation and lookup behavior.
- [ ] Define run creation, status, and replay behavior.
- [ ] Define task creation and dispatch behavior.
- [ ] Define context envelope assembly rules.
- [ ] Define tool grant enforcement.
- [ ] Define artifact write and validation sequence.
- [ ] Define handoff creation and validation sequence.
- [ ] Define trace creation rules.
- [ ] Define retry and partial-result policy.
- [ ] Define failure propagation rules.

Completion artifact target:

- `docs/specs/modules/runtime-orchestrator.md`

## 6. Agent Specs By Stage

Priority: P1 for Markdown-first loop agents, P2 for lifecycle agents, P3 for media-specific behavior.

Reason: agent specs should be grounded in P0 contracts and tool ports.

P1 agent specs:

- `IngestionAgent`
- `UnderstandingAgent`
- `ConnectionAgent`
- `RetrievalPlanner`
- `RetrievalAgent`
- `ReasoningAgent`
- `VerifierAgent`

P2 agent specs:

- `KnowledgeUpdateAgent`
- `CurationAgent`
- `EvaluationAgent`

P3 agent details:

- media-specific extraction, retrieval, reasoning, and verification behavior

- [ ] Define base agent interface.
- [ ] Define `IngestionAgent` implementation-facing spec.
- [ ] Define `UnderstandingAgent` implementation-facing spec.
- [ ] Define `ConnectionAgent` implementation-facing spec.
- [ ] Define `RetrievalPlanner` implementation-facing spec.
- [ ] Define `RetrievalAgent` implementation-facing spec.
- [ ] Define `ReasoningAgent` implementation-facing spec.
- [ ] Define `VerifierAgent` implementation-facing spec.
- [ ] Define `KnowledgeUpdateAgent` implementation-facing spec.
- [ ] Define `CurationAgent` implementation-facing spec.
- [ ] Define `EvaluationAgent` implementation-facing spec.
- [ ] Confirm every agent declares required, optional, and forbidden tool ports.
- [ ] Confirm every agent declares deterministic behavior before optional model behavior.

Completion artifact target:

- `docs/specs/agents/`

## 7. Stage Artifact And Handoff Payloads

Priority: P0 for source, artifact, evidence, and verification skeletons; P1 for first loop payloads; P2 for lifecycle payloads.

Reason: artifacts and handoffs are the backbone of Markdown-first validation.

P0 payloads:

- source, source version, manifest, access unit, artifact meta, trace event, validation summary;
- `IngestArtifact` skeleton;
- `EvidenceBundle` skeleton;
- `VerificationReport` skeleton.

P1 payloads:

- `UnderstandingArtifact`;
- `ConnectionArtifact`;
- `RetrievalPlan`;
- `DraftAnswer` and `ProposedAction`;
- ingest, understand, plan, retrieve, reason, and verify handoffs.

P2 payloads:

- `UpdateCandidate`;
- `CurationDecision`;
- `EvaluationReport`;
- update, curation, and evaluate handoffs.

- [ ] Define `IngestArtifact` payload.
- [ ] Define `IngestToUnderstandHandoff` payload.
- [ ] Define `UnderstandingArtifact` payload.
- [ ] Define `UnderstandToConnectHandoff` payload.
- [ ] Define `ConnectionArtifact` payload.
- [ ] Define `ConnectToVerifyHandoff` payload.
- [ ] Define `RetrievalPlan` payload.
- [ ] Define `PlanToRetrieveHandoff` payload.
- [ ] Define `EvidenceBundle` payload.
- [ ] Define `RetrieveToReasonHandoff` payload.
- [ ] Define `DraftAnswer` and `ProposedAction` payloads.
- [ ] Define `ReasonToVerifyHandoff` payload.
- [ ] Define `VerificationReport` payload.
- [ ] Define `VerifyToUpdateHandoff` payload.
- [ ] Define `UpdateCandidate` payload.
- [ ] Define `UpdateToCurationHandoff` payload.
- [ ] Define `CurationDecision` payload.
- [ ] Define `CurationToEvaluateHandoff` payload.
- [ ] Define `EvaluationReport` payload.

Completion artifact target:

- `docs/specs/contracts/stage-artifacts-and-handoffs.md`

## 8. Markdown-First Fixture Set

Priority: P0 for the minimum fixture path, P1 for full loop fixture coverage, P2 for negative and regression fixtures.

Reason: fixtures are the proof mechanism for implementation-near specs.

P0 fixtures:

- simple Markdown with headings and paragraphs;
- frontmatter;
- expected source records;
- expected access units.

P1 fixtures:

- wiki links;
- decision record;
- expected candidates;
- expected relationship proposals;
- expected retrieval evidence;
- expected verification outcome.

P2 fixtures:

- stale or superseded note;
- unsupported claim;
- duplicate or overlapping concept;
- expected update and evaluation signals.

- [ ] Define fixture naming and directory policy.
- [ ] Define simple Markdown fixture with headings and paragraphs.
- [ ] Define Markdown frontmatter fixture.
- [ ] Define wiki-link fixture.
- [ ] Define decision-record fixture.
- [ ] Define stale or superseded note fixture.
- [ ] Define unsupported claim fixture.
- [ ] Define duplicate or overlapping concept fixture.
- [ ] Define expected source records.
- [ ] Define expected access units.
- [ ] Define expected knowledge candidates.
- [ ] Define expected relationship proposals.
- [ ] Define expected retrieval plans and evidence bundles.
- [ ] Define expected verification reports.
- [ ] Define expected update candidate behavior.
- [ ] Define expected evaluation signals.

Completion artifact target:

- `docs/specs/fixtures/markdown-fixtures.md`

## 9. Validation And Verification Harness

Priority: P0 for schema/ref/source validation, P1 for evidence and handoff validation, P2 for replay and readiness validation.

Reason: Markdown-first specs should be testable before runtime code exists.

P0 validation:

- schema validation;
- ref resolution;
- source hash and version validation;
- artifact validation.

P1 validation:

- handoff validation;
- trace completeness;
- citation-to-evidence validation;
- content-minimal index audit.

P2 validation:

- unsupported claim negative tests;
- run replay validation;
- readiness criteria for runtime code.

- [ ] Define schema validation checklist.
- [ ] Define ref resolution validation checklist.
- [ ] Define artifact validation checklist.
- [ ] Define handoff validation checklist.
- [ ] Define trace completeness validation checklist.
- [ ] Define content-minimal index audit checklist.
- [ ] Define source hash and version validation checklist.
- [ ] Define citation-to-evidence validation checklist.
- [ ] Define unsupported claim negative tests.
- [ ] Define run replay validation.
- [ ] Define acceptance criteria for moving to runtime code.

Completion artifact target:

- `docs/specs/validation/spec-validation-harness.md`

## 10. Readiness Before Runtime Code

Priority: P2.

Reason: runtime code readiness should be checked only after P0 and P1 specs define the Markdown-first path clearly.

- [ ] All required spec folders have an index or first spec.
- [ ] Shared contracts and IDs are defined.
- [ ] Store layout is defined.
- [ ] CLI contracts are defined.
- [ ] Required tool ports are defined.
- [ ] Runtime/orchestrator contract is defined.
- [ ] Markdown-first agent specs are defined.
- [ ] Stage artifact and handoff payloads are defined.
- [ ] Fixture set and expected outputs are defined.
- [ ] Validation harness is defined.
- [ ] Open questions are listed and either resolved or accepted as deferred.
- [ ] No media-specific requirement blocks the Markdown-first path.

Completion artifact target:

- `docs/specs/validation/runtime-code-readiness.md`

## Current Next Item

Start with:

```text
1. Shared Contracts And IDs
```

Reason:

All later specs depend on stable IDs, refs, result shapes, provenance, and validation summaries.
