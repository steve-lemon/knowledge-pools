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
- create sessions, runs, and tasks
- assemble context envelopes
- pass typed records between components
- validate agent input and output schemas
- store handoff artifacts
- persist run traces
- enforce verification before durable updates
- keep provider-specific model state out of the core architecture

Initial implementation can be a small application service rather than a full agent framework.

See [Context and Session Model](context-session-model.md) for state ownership.

## Ingestion Pipeline

Reads source files and creates source-grounded ingest artifacts.

Ingestion preserves and locates evidence. It may emit shallow candidates, but it should not finalize semantic knowledge.

Initial scope:

- Markdown files
- local file metadata
- content hashing
- heading-aware parsing
- wiki-style link/tag extraction
- taxonomy classification
- source manifests and access units
- preview artifact refs
- content-minimal index projections

Later scope:

- PDF
- web pages
- code repositories
- selected conversations

## Understanding Pipeline

Extracts structured knowledge candidates.

Understanding reads ingest artifacts and source access units. It interprets evidence into candidate claims, decisions, concepts, procedures, and questions.

Initial scope:

- heading summaries
- candidate concepts
- candidate claims
- open questions
- evidence span alignment
- ambiguity notes

Later scope:

- decision extraction
- procedure extraction
- confidence estimation
- relation instance candidates that require semantic interpretation

## Knowledge Fabric

The combined storage layer for source-grounded knowledge.

The v1 infrastructure baseline is defined in [Infrastructure Baseline](infrastructure-baseline.md).

V1 uses:

- filesystem-compatible object storage for original sources;
- OpenSearch as the main indexing and query server.

Initial local development form:

```text
knowledge/
  sources/
  manifests/
  opensearch-fixtures/
  runs/
  artifacts/
```

V1 production shape:

```text
object storage
  - original sources
  - parsed source units when useful
  - source manifests

OpenSearch
  - source records
  - access units
  - taxonomy-aware ingest artifacts
  - knowledge records
  - entity instances
  - relation instances
  - retrieval metadata
```

Deferred storage options:

- standalone graph database;
- separate vector database;
- relational metadata database.

## Retrieval Planner

Builds a task-specific retrieval plan.

Example strategies:

- latest project state: decision lookup + temporal filter
- factual lookup: keyword + source lookup
- conceptual synthesis: vector + graph traversal
- wiki context lookup: title + heading + link/backlink metadata
- conflict check: graph contradiction edges + opposing claims
- implementation planning: decisions + procedures + active project memory

## Retrieval Services

Execute retrieval plans.

Initial services:

- OpenSearch source lookup
- OpenSearch keyword search
- OpenSearch structured filter search
- object-store source unit fetch

Later services:

- OpenSearch vector search or a separate vector index
- standalone graph traversal
- contradiction search over relation instances

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
- warnings when evidence was later quarantined or retracted

## Update and Curation Service

Writes durable records after verification.

The curation gate decides whether a candidate update should be:

- accepted
- edited
- deferred
- rejected

Feedback-derived changes should first become update candidates with proposed relationships.

Accepted candidates become durable records only after curation.

See [Feedback Update Relationships](feedback-update-relationships.md).

Rollback and quarantine are handled here as explicit operational events.

Wrongly injected data should be quarantined first, then corrected through source pointer restoration, projection deactivation, reindexing, or retracted knowledge records.

See [Rollback and Quarantine Policy](rollback-and-quarantine.md).

Intentional content deletion uses tombstones and lifecycle states instead of immediate physical deletion.

Deleted content should be removed from normal retrieval, while audit metadata remains available for dependency cleanup and restore decisions.

See [Content Deletion Lifecycle](content-deletion-lifecycle.md).

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
