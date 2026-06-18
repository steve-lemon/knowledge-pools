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

- Start local and inspectable.
- Preserve sources before generating summaries.
- Store original sources in filesystem-compatible object storage.
- Use OpenSearch as the main indexing server.
- Keep every indexed document linked to original source units.
- Use typed records instead of loose text blobs.
- Use a versioned taxonomy before creating graph records.
- Follow the canonical terminology in `docs/architecture/terminology.md`.
- Store run traces from the beginning.
- Add vector search only after OpenSearch source, keyword, and structured retrieval are reliable.
- Add durable memory only behind a curation gate.
- Define lifecycle, access, provenance, and reindex contracts before large-scale ingest.

## Step 1: Project Skeleton

Deliverables:

- CLI entry point.
- Application module layout.
- Local `knowledge/` workspace layout.
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
  sessions/
  runs/
  artifacts/
  memory/
  opensearch-fixtures/
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
- Ingest job state machine with idempotency key.
- Source record schema.
- Content hashing.
- Heading-aware parser.
- Object-store-compatible raw source storage.
- Source manifest schema.
- Access unit schema for large or long files.
- Media ingest strategy interface.
- Version fields for source, manifest, parser, taxonomy, and index.
- Access-control metadata fields.
- Delete/tombstone behavior.
- Taxonomy-aware category assignment.
- Ingest artifact schema.
- Validation report for each ingest artifact.
- Taxonomy proposal generation for unknown concepts.

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

## Step 5: OpenSearch Index Baseline

Deliverables:

- Versioned index naming and aliases.
- OpenSearch mappings for source records and access units.
- OpenSearch mappings for taxonomy-aware ingest artifacts.
- OpenSearch mappings for entity instances and relation instances.
- Source provenance fields on every indexed document.
- Source lookup and keyword search.
- Structured taxonomy filter search.
- Reindex plan for mapping or taxonomy changes.
- Run trace format.

Initial indexed document types:

- source
- access_unit
- ingest_artifact
- entity_instance
- relation_instance
- claim_candidate
- concept_candidate
- question_candidate

## Step 6: Evaluation Seed

Deliverables:

- Minimal regression query format.
- Expected source/access-unit refs.
- Retrieval result comparison report.
- Ingest quality checks for missing source links and parser failures.

## Step 7: Single Agent Contract

Deliverables:

- Agent input contract.
- Agent output contract.
- Tool port interface.
- Model adapter interface.
- Schema validation for agent outputs.

The first agent can be deterministic and model-free. This proves the orchestration contract before adding LLM behavior.

## Step 8: Agent Handoff

Deliverables:

- Handoff record schema.
- Blackboard-style run workspace.
- Sequential handoff from planner to retriever.
- Trace events for each handoff.

## Step 9: Retrieval Planning

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

## Step 10: Basic Ask and Verify

Deliverables:

- `kp ask` creates a retrieval plan.
- Retrieval returns an evidence bundle.
- Reasoning produces a grounded answer.
- Verification checks cited evidence exists.
- Run trace is stored.

## Step 11: Curation and Update

Deliverables:

- Candidate update schema.
- Curation states: `accepted`, `edited`, `deferred`, `rejected`.
- Durable decision and claim records.
- Supersession metadata.

## Step 12: Evaluation Loop

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
