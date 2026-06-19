# Decision: Update Baseline

Date: 2026-06-19
Status: accepted

## Context

The canonical loop includes `update` after `verify` and before `curation`.

Earlier documents defined feedback-derived update candidates, but the update stage itself needed a clear implementation boundary.

Without this boundary, verified answers, user corrections, curation, and durable memory writes could collapse into one noisy step.

## Decision

Define `update` as a proposal-only stage.

`update` consumes `VerifyToUpdateHandoff`, selects update-worthy signals, and emits `UpdateCandidate` artifacts plus an `UpdateToCurationHandoff`.

It must not write durable memory, accept candidates, mutate source lifecycle, or update accepted index projections.

## Rationale

This keeps learning useful without turning every interaction into memory.

The system can preserve verified reusable knowledge, corrections, stale warnings, contradictions, failed approaches, and open questions while still requiring curation before durable storage.

The Markdown-first MVP can implement this with local files, schema validation, candidate emission, and traces.

## Alternatives

- Write verified claims directly to memory.
- Let curation inspect raw verification reports without update candidates.
- Merge update and curation into one stage.

These options either create noisy memory, make curation too expensive, or blur who is allowed to mutate durable knowledge.

## Consequences

- The loop gains a clear learning proposal layer.
- Curation receives smaller, typed candidate records.
- Update requires strict provenance and schema validation.
- Durable memory is delayed until curation, which keeps rollback and audit behavior cleaner.

## Follow-ups

- Define curation baseline after update.
- Implement Markdown/text update candidates before media-derived candidates.
- Add duplicate candidate detection before accepting durable records.
