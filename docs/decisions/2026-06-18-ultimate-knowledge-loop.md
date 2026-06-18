# Decision: Ultimate Knowledge Loop

Date: 2026-06-18
Status: accepted

## Context

The initial project loop was expressed as:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

This captured the core movement beyond basic RAG, but it did not explicitly name retrieval planning, curation, or evaluation.

## Decision

Use the following target loop as the architecture baseline:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> evaluate
```

Treat curation as a required gate inside the update step before durable memory is written.

## Rationale

The project is intended to support long-running knowledge work, not only document Q&A. That requires:

- planning before retrieval;
- hybrid evidence gathering;
- source-grounded reasoning;
- verification before trust;
- curated memory updates;
- evaluation traces for improvement.

## Alternatives

- Keep the shorter original loop.
- Use a classic `retrieve -> generate` RAG pipeline.
- Start with a full multi-agent framework before defining storage and records.

## Consequences

The architecture becomes slightly more complex, but the complexity maps directly to known RAG failure modes. The MVP should still implement this gradually, starting with local ingestion, records, search, and basic verification.

## Follow-ups

- Implement local CLI skeleton.
- Define on-disk record schemas.
- Add a run trace format.
- Decide the first storage backend.

