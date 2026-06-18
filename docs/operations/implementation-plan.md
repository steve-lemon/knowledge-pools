# Implementation Plan

This plan turns the target architecture into concrete implementation steps.

## Current Target

Build a local CLI MVP that proves the architecture with repository files before adding heavy infrastructure.

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
- Use typed records instead of loose text blobs.
- Use a versioned taxonomy before creating graph records.
- Store run traces from the beginning.
- Add vector search only after source and keyword retrieval are reliable.
- Add durable memory only behind a curation gate.

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
  sessions/
  runs/
  artifacts/
  memory/
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
- Source record schema.
- Content hashing.
- Heading-aware parser.
- Raw and parsed source storage.
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

## Step 5: Records and Indexes

Deliverables:

- On-disk JSONL records.
- Source lookup.
- Keyword index.
- Run trace format.

Initial record types:

- source
- chunk
- claim_candidate
- concept_candidate
- question_candidate

## Step 6: Single Agent Contract

Deliverables:

- Agent input contract.
- Agent output contract.
- Tool port interface.
- Model adapter interface.
- Schema validation for agent outputs.

The first agent can be deterministic and model-free. This proves the orchestration contract before adding LLM behavior.

## Step 7: Agent Handoff

Deliverables:

- Handoff record schema.
- Blackboard-style run workspace.
- Sequential handoff from planner to retriever.
- Trace events for each handoff.

## Step 8: Retrieval Planning

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

## Step 9: Basic Ask and Verify

Deliverables:

- `kp ask` creates a retrieval plan.
- Retrieval returns an evidence bundle.
- Reasoning produces a grounded answer.
- Verification checks cited evidence exists.
- Run trace is stored.

## Step 10: Curation and Update

Deliverables:

- Candidate update schema.
- Curation states: `accepted`, `edited`, `deferred`, `rejected`.
- Durable decision and claim records.
- Supersession metadata.

## Step 11: Evaluation Loop

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
- JSONL for early records.
- SQLite FTS after the file-based index becomes limiting.

Reason:

TypeScript keeps the CLI, schemas, and future service layer close together while still allowing fast local iteration.
