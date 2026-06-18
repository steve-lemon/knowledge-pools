# Implementation Plan

This plan turns the target architecture into concrete implementation steps.

## Current Target

Build a CLI MVP that proves the architecture with filesystem-compatible source storage and an OpenSearch-compatible indexing boundary.

Local development may use files or fixtures before a real OpenSearch instance is connected, but the document shapes and query boundary should be designed for OpenSearch from the beginning.

Target commands:

```text
kp ingest docs/
kp search "why does Knowledge Pools need verification?"
kp ask "what problem is this project solving?"
kp verify <run-id>
```

## Guiding Constraints

- Single repository first.
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
- Add durable memory only behind a curation gate.
- Define the smallest useful lifecycle and provenance contract before large-scale ingest.
- Defer multi-repository, clustering, full ACL, distributed queues, and separate graph/vector databases.

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

- Markdown file scanner.
- Media concept fixtures for Markdown, image, WAV, MP4, and PDF.
- Simple ingest job status.
- Source record schema.
- Source version lifecycle with current pointer and supersession status.
- Content hashing.
- Heading-aware parser.
- Object-store-compatible raw source storage.
- Source manifest schema.
- Access unit schema for large or long files.
- Media ingest strategy interface.
- Version fields for source, manifest, parser, taxonomy, and index.
- Current-vs-historical retrieval fields such as `is_current` and `version_status`.
- Minimal lifecycle metadata.
- Taxonomy-aware category assignment.
- Ingest artifact schema.
- Validation report for each ingest artifact.
- Taxonomy proposal generation for unknown concepts.
- Shallow candidate generation from visible source structure only.
- Handoff contract from ingest to understand.
- Ingest readiness review before moving to understand.

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

Deliverables:

- Understand baseline architecture document.
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

Initial understanding inputs:

- source record;
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

## Step 6: OpenSearch Index Baseline

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

## Step 7: Evaluation Seed

Deliverables:

- Minimal regression query format.
- Expected source/access-unit refs.
- Retrieval result comparison report.
- Ingest quality checks for missing source links and parser failures.

## Step 8: Single Agent Contract

Deliverables:

- Agent input contract.
- Agent output contract.
- Tool port interface.
- Model adapter interface.
- Schema validation for agent outputs.

The first agent can be deterministic and model-free. This proves the orchestration contract before adding LLM behavior.

## Step 9: Agent Handoff

Deliverables:

- Handoff record schema.
- Blackboard-style run workspace.
- Sequential handoff from planner to retriever.
- Trace events for each handoff.

## Step 10: Retrieval Planning

Deliverables:

- Task classifier.
- Retrieval plan schema.
- Evidence bundle schema.

Initial plan types:

- source_lookup
- keyword_search
- concept_search
- decision_recall
- verification_check

## Step 11: Basic Ask and Verify

Deliverables:

- `kp ask` creates a retrieval plan.
- Retrieval returns an evidence bundle.
- Reasoning produces a grounded answer.
- Verification checks cited evidence exists.
- Run trace is stored.

## Step 12: Curation and Update

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

## Step 13: Evaluation Loop

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
