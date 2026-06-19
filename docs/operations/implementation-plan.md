# Implementation Plan

This plan turns the target architecture into concrete implementation steps.

Use [Work Context Packs](work-context-packs.md) to choose the smallest relevant document set before working on a step.

The canonical runtime stage flow is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

Implementation steps do not have to follow this exact order when infrastructure must be built first, but every runtime stage should map back to this flow.

## Current Target

Build a Markdown-first CLI MVP that proves the architecture with filesystem-compatible source storage and an OpenSearch-compatible indexing boundary.

Local development may use files or fixtures before a real OpenSearch instance is connected, but the document shapes and query boundary should be designed for OpenSearch from the beginning.

The first implementation is a vertical slice for Markdown/text only.

Image, PDF, audio, and video support should be added after the full Markdown/text flow works end to end.

Target commands:

```text
kp ingest docs/
kp search "why does Knowledge Pools need verification?"
kp ask "what problem is this project solving?"
kp verify <run-id>
```

## Guiding Constraints

- Single repository first.
- Markdown/text first.
- Prove the full loop before expanding media types.
- Start local and inspectable.
- Preserve sources before generating summaries.
- Store original sources in filesystem-compatible object storage.
- Use OpenSearch-compatible documents first, then connect a real OpenSearch server.
- Keep every indexed document linked to original source units.
- Treat index documents as retrieval maps, not content stores.
- Use typed records instead of loose text blobs.
- Use a versioned taxonomy before creating graph records.
- Follow the canonical terminology in `docs/architecture/terminology.md`.
- Review stage boundaries before moving to the next major stage. See [Stage Transition Guidelines](stage-transition-guidelines.md).
- Store run traces from the beginning.
- Add vector search only after OpenSearch source, keyword, and structured retrieval are reliable.
- Add durable memory only behind the `curation` stage.
- Define the smallest useful lifecycle and provenance contract before large-scale ingest.
- Treat image, audio, video, and PDF as extension tracks after the Markdown/text MVP.
- Defer multi-repository, clustering, full ACL, distributed queues, and separate graph/vector databases.

## Implementation Strategy

Use [Markdown-First Implementation Strategy](markdown-first-implementation.md) as the implementation scope control document.

The architecture documents describe the target system.

The first implementation should prove the smallest useful vertical slice:

```text
Markdown source
  -> ingest
  -> understand
  -> connect
  -> plan
  -> retrieve
  -> reason
  -> verify
  -> update candidate
  -> trace/evaluate
```

This means:

- implement deterministic Markdown/text parsing before media parsing;
- implement local JSON/file-backed records before external services;
- implement fixture search before real OpenSearch;
- implement cited draft answers before multi-modal reasoning;
- implement answer verification for Markdown evidence before expanding media verification.

Do not implement all media strategies at once.

Each additional media type should be added only after the Markdown/text regression path remains green.

## Step 1: Project Skeleton

Deliverables:

- CLI entry point.
- Application module layout.
- Single repository workspace layout.
- Basic configuration file.

Suggested modules:

```text
src/
  cli/
  core/
  orchestrator/
  sessions/
  artifacts/
  ingest/
  records/
  retrieve/
  reason/
  verify/
  update/
  eval/
```

## Step 2: Session, Run, and Artifact Foundation

Deliverables:

- Session record schema.
- Run record schema.
- Task record schema.
- Context envelope schema.
- Artifact metadata schema.
- Trace event schema.
- Local directories for sessions, runs, tasks, artifacts, and traces.

Initial layout:

```text
knowledge/
  sources/
  manifests/
  taxonomy/
  index-documents/
  sessions/
  runs/
  artifacts/
  eval/
```

This step must be implemented before agent-to-agent workflows. The system should own context and session state before any LLM adapter is introduced.

## Step 3: Taxonomy Foundation

Deliverables:

- Initial `knowledge-pools-core` taxonomy bundle.
- Taxonomy TypeScript types.
- Taxonomy validation rules.
- Taxonomy proposal schema.
- Bundle version and checksum handling.

The taxonomy should start small and evolve through human-reviewed proposals.

## Step 4: Local Source Ingestion

Deliverables:

- Ingestion Agent detailed spec.
- Markdown file scanner.
- Markdown concept fixtures.
- Media concept fixtures for image, WAV, MP4, and PDF as documentation-only expansion references.
- Simple ingest job status.
- Source record schema.
- Source version lifecycle with current pointer and supersession status.
- Content hashing.
- Heading-aware parser.
- Object-store-compatible raw source storage.
- Source manifest schema.
- Access unit schema for large or long files.
- Media ingest strategy interface, implemented first for Markdown/text.
- Version fields for source, manifest, parser, taxonomy, and index.
- Current-vs-historical retrieval fields such as `is_current` and `version_status`.
- Minimal lifecycle metadata.
- Taxonomy-aware category assignment.
- Ingest artifact schema.
- Validation report for each ingest artifact.
- Taxonomy proposal generation for unknown concepts.
- Shallow candidate generation from visible source structure only.
- Handoff contract from ingest to understand.
- `IngestToUnderstandHandoff` artifact schema and validation.
- Ingest readiness review before moving to understand.

V1 implementation scope:

- Markdown/text only;
- heading-aware sections and blocks;
- wiki links and tags as structural signals;
- outline or short summary previews optional;
- no image, audio, video, or PDF parsing yet.

First source fields:

- `id`
- `path`
- `title`
- `content_hash`
- `imported_at`
- `parser`
- `metadata`
- `taxonomy_version`
- `category_ids`

## Step 5: Understanding Baseline

Purpose:

- convert source-grounded ingest artifacts into explicit knowledge candidates;
- make claims, decisions, concepts, procedures, questions, constraints, and bounded summaries searchable as candidate meaning units;
- preserve evidence refs, ambiguity, confidence, and review needs before connection or curation.
- keep source/document understanding separate from runtime user-question understanding.

Deliverables:

- Understand baseline architecture document.
- Understanding Agent detailed spec.
- Ingestion Agent detailed spec.
- Understanding artifact schema.
- Knowledge candidate schema for claims, decisions, concepts, procedures, and questions.
- Constraint and bounded summary candidate schema.
- Evidence span alignment from candidates back to access units.
- Ambiguity and confidence notes.
- Review request artifact schema.
- Model adapter metadata for model-assisted extraction.
- Rules that keep generated summaries outside OpenSearch by default.
- Validation that understanding outputs remain candidates, not durable knowledge records.
- Initial structural understanding rules before model-assisted extraction.
- Local run workspace layout for understanding artifacts, candidates, ambiguity notes, review requests, and traces.
- V1 deterministic Markdown/text structural extractors.
- Media understand concept proofs for Markdown/text, image, WAV/audio, MP4/video, and PDF.
- Markdown/text understanding implementation first.
- Understand tool sequence using `artifact.read`, `source.locate`, `source.read`, `taxonomy.read`, `taxonomy.validate`, `schema.validate`, `candidate.emit`, `ambiguity.emit`, `review.request`, `artifact.write`, and `audit.trace`.
- Failure classes for invalid handoff, unresolved refs, schema errors, and invalid model output.
- Quality report with candidate counts, evidence coverage, review rate, unresolved refs, and schema failures.
- Understand readiness checklist and quality gate before handoff to connect.
- V1 acceptance criteria for Markdown/text, deterministic extraction, evidence refs, schema validation, and no durable mutation.

V1 implementation scope:

- deterministic Markdown/text candidate extraction;
- no OCR, transcript, subtitle, scene, or PDF block extraction yet.

Initial understanding inputs:

- source record;
- ingest-to-understand handoff ref;
- source version id;
- source manifest ref;
- access unit refs;
- preview refs;
- taxonomy bundle id and version;
- ingest artifact ref;
- validation status.

First validation rules:

- every candidate has at least one evidence ref;
- every evidence ref resolves to a known source version and access unit;
- generated interpretation records generator metadata;
- long generated text remains outside OpenSearch;
- candidate status is never promoted to durable record status inside understand.
- structural extraction can run without a model adapter.

## Step 6: Connection Baseline

Purpose:

- relate knowledge candidates to existing records, candidates, sources, and graph context;
- propose duplicate, support, contradiction, dependency, supersession, mention, and applicability relationships;
- preserve evidence refs, rationale, ambiguity, and review needs before verification or curation;
- keep relationship proposals separate from durable graph records.
- use `RelationshipProposal` for connect outputs and reserve shallow relation candidates for ingest signals.

Deliverables:

- Connect baseline architecture document.
- Understand and connect boundary document.
- Understand-to-connect handoff artifact schema and validation.
- Connection Agent detailed spec.
- Connection artifact schema.
- Relationship proposal schema.
- Duplicate and unresolved relation proposal schema.
- Quality report with relation counts, unresolved endpoints, evidence coverage, review rate, and schema failures.
- Media connect concept proofs for Markdown/text, image, WAV/audio, MP4/video, and PDF.
- Markdown/text connection implementation first.
- Connect readiness checklist and tool permission review.
- Deterministic matching policy for labels, aliases, explicit mentions, compatible candidate kinds, local record fixtures, and taxonomy relation rules.
- Connect tool sequence using `artifact.read`, `record.search`, `taxonomy.read`, `taxonomy.validate`, `schema.validate`, `candidate.emit`, `artifact.write`, and `audit.trace`, with optional `graph.query`, `index.search`, `model.complete`, `ambiguity.emit`, and `review.request`.
- Failure classes for invalid handoff, unresolved candidates, unresolved endpoints, taxonomy relation errors, schema errors, and invalid model output.
- V1 acceptance criteria for deterministic duplicate, mention, and support proposals with no durable graph mutation.

V1 implementation scope:

- deterministic duplicate, mention, and support proposals for Markdown/text candidates;
- no media-derived relationship proposals yet.

Initial connection inputs:

- understand-to-connect handoff ref;
- understanding artifact ref;
- knowledge candidate refs;
- quality report ref;
- taxonomy bundle id and version;
- source id and source version id;
- existing record or graph search access.

First validation rules:

- every relationship proposal has `from_ref` and `to_ref`;
- every endpoint ref resolves or is marked unresolved;
- every relation type is allowed by the taxonomy version;
- relationship proposal status is never promoted to durable graph record status inside connect;
- relation proposals preserve evidence refs or explicit indirect-evidence rationale;
- deterministic matching can run without a model adapter.

## Step 7: Verification Baseline

Purpose:

- audit relationship proposals before they become durable graph records;
- audit Markdown-first draft answers after retrieval and reasoning baselines;
- surface unsupported, stale, uncertain, or contradictory outputs;
- preserve assumptions as assumptions;
- keep verification reports separate from curation decisions and durable memory writes.

Deliverables:

- Verify baseline architecture document.
- Connect and verify boundary document.
- Connect-to-verify handoff artifact schema and validation.
- Verifier Agent detailed spec.
- Verification report schema.
- Verification result schema.
- Relationship proposal verification mode.
- Markdown-first answer verification mode for `DraftAnswer` and `ProposedAction`.
- Media verify concept proofs for Markdown/text, image, WAV/audio, MP4/video, and PDF.
- Quality report with checked count, verified count, rejected count, unsupported count, uncertain count, stale evidence count, review rate, and schema failures.
- Verification tool sequence using `artifact.read`, `schema.validate`, `taxonomy.read`, `taxonomy.validate`, `verification.check`, `artifact.write`, and `audit.trace`, with optional `record.search`, `graph.query`, `source.locate`, `source.read`, `retrieval.fetch_evidence`, `review.request`, and `model.complete`.
- Failure classes for invalid handoff, unresolved proposals, unresolved endpoints, missing evidence, taxonomy errors, schema errors, and invalid model output.
- V1 acceptance criteria for deterministic relationship proposal verification with no durable graph mutation.
- V1 acceptance criteria for Markdown/text answer verification with no durable memory mutation.

Initial verification inputs:

- connect-to-verify handoff ref;
- connection artifact ref;
- relationship proposal refs;
- quality report ref;
- taxonomy bundle id and version;
- endpoint refs;
- evidence refs;
- reason-to-verify handoff ref for answer verification;
- draft answer or proposed action ref;
- evidence bundle ref;
- claim refs;
- assumption refs;
- cited evidence refs.

First validation rules:

- every verification target ref resolves;
- every evidence ref resolves or is marked missing;
- every relation type validates against taxonomy;
- verification result status is audit-only and never promoted to durable graph status inside verify;
- verified proposals remain pending curation;
- verified claims remain audit outcomes, not durable memory;
- assumptions are not promoted to supported facts;
- deterministic verification can run without a model adapter.

## Step 8: OpenSearch Index Baseline

Deliverables:

- OpenSearch-compatible document fixtures for source records and access units.
- OpenSearch-compatible document fixtures for taxonomy-aware ingest artifacts.
- OpenSearch-compatible document fixtures for shallow ingest candidates.
- OpenSearch-compatible document fixtures for understanding candidates.
- Source provenance fields on every indexed document.
- Content-minimal index document policy.
- Deterministic index ID policy.
- OpenSearch index schema with strict field types.
- Typed runtime attribute storage.
- Validation that the same attribute key always maps to the same value type.
- Fixture checks that full raw content is not stored in index documents.
- Local fixture search for source lookup and keyword search.
- OpenSearch mapping fixtures.
- Run trace format.
- Rollback-safe projection fields such as `projection_status` and `rollback_event_id`.
- Default retrieval filters that exclude quarantined and retracted projections.
- Tombstone-aware projection fields such as `tombstone_id`.
- Default retrieval filters that exclude hidden, tombstoned, archived, deleted, and purged content.

Initial indexed document types:

- source
- access_unit
- ingest_artifact
- shallow_entity_candidate
- shallow_relation_candidate
- claim_candidate
- decision_candidate
- concept_candidate
- procedure_candidate
- question_candidate

V1 implementation scope:

- local JSON fixture index first;
- Markdown source and access-unit projections first;
- OpenSearch-compatible mapping files before connecting a real OpenSearch server.

## Step 9: Evaluation Seed

Deliverables:

- Minimal regression query format.
- Expected source/access-unit refs.
- Retrieval result comparison report.
- Ingest quality checks for missing source links and parser failures.

## Step 10: Single Agent Contract

Deliverables:

- Agent input contract.
- Agent output contract.
- Agent superclass contract and TypeScript reference types.
- Tool port interface.
- Shared agent tool pool.
- Stage-scoped tool permission policy.
- Tool side effect levels and trace requirements.
- V1 implementable tool-port subset backed by local files, JSON artifacts, deterministic functions, and optional OpenSearch/model adapters.
- Agent tool contracts that link each agent role to required, optional, and forbidden ports.
- Model adapter interface.
- Schema validation for agent outputs.
- Shared handoff envelope type with stage-specific payload schemas.

The first agent can be deterministic and model-free. This proves the orchestration contract before adding LLM behavior.

## Step 11: Agent Handoff

Deliverables:

- Handoff record schema.
- Blackboard-style run workspace.
- Sequential handoff from planner to retriever.
- Trace events for each handoff.

## Step 12: Retrieval Planning

Purpose:

- interpret the user or workflow request as task understanding;
- decide what evidence is needed before retrieval starts;
- produce a schema-valid `RetrievalPlan`;
- hand off retrieval requirements to the Retrieval Agent without fetching full evidence.

Deliverables:

- Plan baseline architecture document.
- Plan-to-retrieve handoff artifact schema and validation.
- Retrieval Planner detailed spec.
- Task classifier.
- Task understanding schema for user intent, constraints, freshness scope, required evidence, and answer shape.
- Retrieval plan schema.
- Evidence bundle schema.
- Quality report with intent confidence, retrieval step count, freshness scope, conflict-search flag, and schema failures.
- Plan tool sequence using `retrieval.plan`, `record.search`, `index.search`, `schema.validate`, `artifact.write`, and `audit.trace`, with optional `graph.query`, `taxonomy.read`, `model.complete`, `artifact.read`, and `preview.lookup`.
- Failure classes for invalid task input, unsupported retrieval mode, missing schema, missing indexes, invalid model output, and invalid handoff.
- V1 acceptance criteria for deterministic source lookup, keyword search, decision recall, and hybrid evidence lookup planning.

Initial plan types:

- source_lookup
- keyword_search
- concept_search
- decision_recall
- verification_check
- conflict_check
- latest_state_summary
- source_audit

First validation rules:

- task intent is present;
- expected answer shape is present;
- freshness scope is explicit;
- at least one retrieval step is present;
- required evidence types are explicit;
- conflict-search requirement is explicit;
- the planner does not fetch full evidence or synthesize an answer.

## Step 13: Retrieval Baseline

Purpose:

- turn a validated `RetrievalPlan` into a bounded `EvidenceBundle`;
- execute retrieval plans;
- return evidence bundles rather than raw hits;
- preserve source, record, version, freshness, and conflict refs;
- make missing evidence explicit;
- hand off evidence to reasoning without synthesizing answers.

Deliverables:

- Retrieve baseline architecture document.
- Retrieve-to-reason handoff artifact schema and validation.
- Retrieval Agent detailed spec.
- Evidence bundle schema.
- Missing evidence note schema.
- Conflict candidate refs in evidence bundles.
- Media retrieve concept proofs for Markdown/text, image, WAV/audio, MP4/video, and PDF.
- Markdown/text retrieval implementation first.
- Retrieve readiness review and tool permission check.
- Retrieve tool sequence using `artifact.read`, `schema.validate`, `index.search`, `record.search`, `source.locate`, `source.read`, `retrieval.fetch_evidence`, `artifact.write`, and `audit.trace`, with optional `graph.query`, `preview.lookup`, `taxonomy.read`, and `model.embed`.
- Failure classes for invalid handoff, missing retrieval plan, unsupported retrieval mode, unresolved source/access-unit refs, missing evidence, permission denied, and schema errors.
- Local fixture retrieval from source, access-unit, record, preview, and graph-like artifacts.
- Retrieval returns an evidence bundle.
- Retrieve-to-reason handoff is emitted.
- Run trace is stored.

V1 implementation scope:

- source lookup and keyword search over Markdown/text fixtures;
- evidence bundles from Markdown sections or blocks;
- no image region, audio span, video scene, or PDF block fetching yet.

First validation rules:

- `PlanToRetrieveHandoff` validates;
- retrieval plan ref resolves;
- every retrieval step is allowed by tool grants;
- every evidence item has an evidence ref;
- source evidence includes source id and source version id;
- missing evidence is explicit;
- conflict refs are included when conflict search was requested;
- retrieve does not synthesize answers.

## Step 14: Basic Ask, Reason, and Verify

Purpose:

- turn retrieved evidence bundles into cited draft answers or proposed actions;
- distinguish supported claims, assumptions, unknowns, missing evidence, and conflicts;
- hand draft outputs to verification without certifying them inside reason;
- verify answer claims against cited evidence;
- keep reasoning and verification separate from retrieval and durable updates.

Deliverables:

- Reason baseline architecture document.
- Reasoning Agent detailed spec.
- Answer draft schema with evidence citations.
- Reason-to-verify handoff artifact schema and validation.
- Media reason concept proofs for Markdown/text, image, WAV/audio, MP4/video, and PDF.
- Markdown/text reasoning implementation first.
- Reason readiness review and tool permission check.
- Reason tool sequence and forbidden-port review.
- Markdown-first answer verification mode implementation.
- `kp ask` creates a retrieval plan, retrieves evidence, reasons from evidence, and stores a run trace.
- Verification checks cited evidence exists and flags unsupported claims.
- Verification emits audit results without rewriting the draft answer.

V1 implementation scope:

- draft answers from Markdown/text evidence bundles;
- verification checks claim-to-section or claim-to-block citations;
- no multi-modal answer verification yet.

First validation rules:

- reasoning consumes `RetrieveToReasonHandoff`;
- every answer claim cites evidence or is marked as assumption;
- verification consumes `ReasonToVerifyHandoff`;
- verifier checks cited evidence refs resolve;
- verifier checks Markdown section or block refs before multi-media verification;
- unsupported claims are flagged;
- assumptions remain assumptions;
- reasoning and verification do not write durable memory.

## Step 15: Curation and Update

Deliverables:

- Candidate update schema.
- Feedback update relationship rules.
- Relationship proposal schema for update candidates.
- Curation states: `accepted`, `edited`, `deferred`, `rejected`.
- Durable decision and claim records.
- Supersession metadata.
- Rollback event schema.
- Quarantine and retraction handling for bad accepted records.
- Impact analysis for records derived from bad sources, candidates, or projections.
- Tombstone record schema.
- Content hide, soft-delete, archive, restore, and purge workflow definitions.
- Delete propagation rules for source versions, access units, previews, candidates, records, and relations.

## Step 16: Evaluation Loop

Deliverables:

- Store retrieval misses.
- Store verifier failures.
- Store user corrections.
- Add simple quality reports.

## First Engineering Decision Needed

Choose the initial runtime stack.

Recommended default:

- TypeScript for CLI and typed records.
- Node.js filesystem APIs for local storage.
- Local filesystem as the first object-store adapter.
- OpenSearch-compatible document fixtures before connecting a real OpenSearch instance.
- OpenSearch as the first real indexing server.

Reason:

TypeScript keeps the CLI, schemas, and future service layer close together while still allowing fast local iteration. Local fixtures keep the first steps lightweight without designing away from the OpenSearch target.
