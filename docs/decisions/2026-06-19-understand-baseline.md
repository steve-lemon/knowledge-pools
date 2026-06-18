# Decision: Understand Baseline

Date: 2026-06-19
Status: accepted

## Context

The project completed the ingest baseline and explicitly defined the ingest-to-understand boundary.

The next stage is `understand`.

The key risk is allowing generated summaries or model interpretation to become durable knowledge without connection, verification, and curation.

## Decision

Define `understand` as the stage that turns source-grounded ingest artifacts into structured knowledge candidates.

Understand may extract:

- claims;
- decisions;
- concepts;
- procedures;
- questions;
- constraints;
- bounded summaries.

All outputs remain candidates.

Durable records are created only after later connection, verification, and curation.

## Rationale

This keeps the system stronger than chunk retrieval while avoiding premature memory mutation.

It also keeps the architecture model-independent: the stage can use deterministic extraction, model-assisted extraction, or both, as long as outputs conform to schemas and preserve evidence refs.

## Alternatives

- Let ingest create semantic records directly.
- Let understand write durable knowledge records.
- Store generated summaries as the primary knowledge layer.
- Depend on provider-specific LLM memory for understanding continuity.

## Consequences

The implementation needs:

- an `UnderstandingArtifact` schema;
- knowledge candidate schemas;
- evidence alignment rules;
- ambiguity and review request artifacts;
- validation that candidates are not durable records;
- model adapter metadata when model-assisted extraction is used.

## Follow-ups

- Define connect-stage boundary and relation proposal schema.
- Add fixture examples for Markdown-first structural understanding.
- Define candidate indexing fixtures.
- Add validation tests for missing evidence refs and long generated text.
