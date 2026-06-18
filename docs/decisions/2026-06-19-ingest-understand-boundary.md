# Decision: Ingest and Understand Boundary

Date: 2026-06-19
Status: accepted

## Context

The ingest architecture now handles source storage, media-specific access units, previews, taxonomy classification, content-minimal indexing, and shallow graph candidates.

This creates a boundary risk: ingest could become too semantic and overlap with `understand`.

## Decision

Define the v1 boundary as:

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
```

Ingest may emit shallow candidates from visible source structure. It must not create durable knowledge records.

Understand emits knowledge candidates such as claims, decisions, concepts, procedures, and questions. These remain candidates until connection, verification, and curation.

## Rationale

This keeps source handling deterministic and idempotent while allowing semantic interpretation to evolve independently.

It also prevents generated summaries, parser output, or taxonomy classifications from being mistaken for verified knowledge.

## Consequences

Implementation should define:

- `IngestArtifact`;
- `UnderstandingArtifact`;
- handoff schema from ingest to understand;
- candidate status fields;
- evidence refs for every semantic candidate;
- validation that durable knowledge is created only after later stages.

