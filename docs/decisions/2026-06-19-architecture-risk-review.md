# Decision: Architecture Risk Review Before Implementation

Date: 2026-06-19
Status: accepted

## Context

The architecture now includes taxonomy-governed ingest, media-specific ingest strategies, object storage, OpenSearch, and LLM-independent agent contracts. Before implementation, the user asked for a deeper review of missed areas and possible improvements.

## Decision

Record an architecture risk review and use it to prioritize implementation prerequisites.

The review identifies missing or under-specified areas:

- security and access control;
- retention and deletion;
- duplicate detection;
- ingest idempotency and retry;
- OpenSearch mapping evolution;
- source update diffing;
- provenance depth;
- evaluation and regression sets;
- multi-project or multi-tenant boundaries;
- observability;
- derived object management.

## Rationale

These concerns are easier to model before implementation than to retrofit after ingesting many sources. The project should still keep infrastructure simple, but critical metadata and lifecycle contracts should be explicit early.

## Consequences

The implementation plan should include source manifests, access units, OpenSearch aliases, ingest job state, provenance fields, access metadata, deletion policy, and regression set shape before advanced agent behavior.

## Follow-ups

- Define source manifest schema.
- Define OpenSearch document shapes.
- Define ingest job state machine.
- Define source update/delete behavior.
- Define minimal access-control fields.
- Define regression query format.

