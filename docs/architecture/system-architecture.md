# System Architecture

This document maps the ultimate knowledge loop to concrete system components.

## Component Map

```text
interfaces
  -> orchestrator
  -> ingestion pipeline
  -> understanding pipeline
  -> knowledge fabric
  -> retrieval planner
  -> retrieval services
  -> reasoning service
  -> verification service
  -> update and curation service
  -> evaluation store
```

## Interfaces

Initial interfaces:

- CLI for local MVP operations.
- File-based repository for documents and records.
- Later API or web UI for interactive use.

## Orchestrator

Coordinates agent workflows.

Responsibilities:

- choose workflow type
- pass typed records between components
- persist run traces
- enforce verification before durable updates

Initial implementation can be a small application service rather than a full agent framework.

## Ingestion Pipeline

Reads source files and creates source records.

Initial scope:

- Markdown files
- local file metadata
- content hashing
- heading-aware parsing

Later scope:

- PDF
- web pages
- code repositories
- selected conversations

## Understanding Pipeline

Extracts structured knowledge candidates.

Initial scope:

- heading summaries
- candidate concepts
- candidate claims
- open questions

Later scope:

- decision extraction
- procedure extraction
- confidence estimation
- evidence span alignment

## Knowledge Fabric

The combined storage layer for source-grounded knowledge.

Initial local form:

```text
knowledge/
  sources/
  records/
    claims/
    concepts/
    decisions/
    questions/
  graph/
  indexes/
  runs/
```

Target storage options:

- source store: filesystem or object storage
- structured records: SQLite or Postgres
- graph: Kuzu, SQLite tables, or Postgres
- vector index: local embeddings first, then pgvector or Qdrant
- keyword index: SQLite FTS or Tantivy

## Retrieval Planner

Builds a task-specific retrieval plan.

Example strategies:

- latest project state: decision lookup + temporal filter
- factual lookup: keyword + source lookup
- conceptual synthesis: vector + graph traversal
- conflict check: graph contradiction edges + opposing claims
- implementation planning: decisions + procedures + active project memory

## Retrieval Services

Execute retrieval plans.

Initial services:

- source lookup
- keyword search
- record search

Later services:

- vector search
- graph traversal
- temporal search
- contradiction search

## Reasoning Service

Synthesizes answers or action plans from evidence bundles.

Rules:

- separate evidence from inference
- label assumptions
- surface missing information
- cite source or record identifiers

## Verification Service

Audits reasoning output.

Initial checks:

- cited evidence exists
- answer claims are supported by evidence bundle
- stale records are not presented as current

Later checks:

- contradiction coverage
- confidence calibration
- source authority scoring
- regression tests against known questions

## Update and Curation Service

Writes durable records after verification.

The curation gate decides whether a candidate update should be:

- accepted
- edited
- deferred
- rejected

## Evaluation Store

Keeps traces for improvement.

Records:

- question or task
- retrieval plan
- evidence bundle metadata
- answer
- verification result
- accepted updates
- user corrections

## First Build Target

The first implementation target is a local CLI MVP:

```text
kp ingest docs/
kp search "why does Knowledge Pools need verification?"
kp ask "what problem is this project solving?"
kp verify <run-id>
```

This MVP should prove the architecture with simple local files before adding heavier infrastructure.

