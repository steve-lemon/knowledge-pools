# Decision: Evaluate Baseline

Date: 2026-06-19
Status: accepted

## Context

The curation stage now emits `CurationDecision` artifacts and `CurationToEvaluateHandoff`.

The final loop stage needs to record whether retrieval, reasoning, verification, update, and curation behaved well enough to improve future work.

## Decision

Define `evaluate` as the learning signal stage.

Evaluation records quality signals and reports, but it must not write durable memory, decide curation, emit update candidates, or mutate source/index lifecycle state.

Markdown/text runs are the first evaluation scope.

## Rationale

The system needs a way to learn from failures without bypassing the governance loop.

Evaluation should make issues visible and create regression material, not silently self-modify.

## Consequences

- Completed runs can produce quality signals.
- Future implementation work can use evaluation reports as regression fixtures.
- Durable memory remains protected behind update and curation.
- Media-specific evaluation can be added after media verification and curation are stable.

## Follow-ups

- Define evaluate readiness review and tool permission check.
- Add media evaluation concept proofs after baseline purpose is reviewed.
- Create initial Markdown-first regression fixture format.
