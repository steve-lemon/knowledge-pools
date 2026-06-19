# Decision: Reason Baseline

Date: 2026-06-19
Status: accepted

## Context

The project has defined `plan` and `retrieve`.

`retrieve` now produces `EvidenceBundle` and `RetrieveToReasonHandoff`.

The next stage needs to synthesize from evidence without becoming verification, retrieval, update, or curation.

## Decision

Define `reason` as the stage that consumes retrieved evidence and produces a `DraftAnswer` or `ProposedAction`.

Reason must cite evidence refs, label assumptions, preserve missing evidence and conflicts, and hand the draft to verification through `ReasonToVerifyHandoff`.

## Rationale

This keeps answer generation inspectable.

It also prevents reasoning from silently certifying itself or writing durable memory.

## Alternatives

- Let retrieval directly produce answers.
- Let verification and reasoning run as one stage.
- Let reason search for more evidence freely.

These options make provenance and responsibility harder to audit.

## Consequences

Reasoning output remains draft until verification.

The system needs explicit claim refs, assumption refs, cited evidence refs, and a reason-to-verify handoff.

## Follow-ups

- Add media reason concept proofs.
- Add reason readiness review.
- Implement answer verification after the reason baseline is stable.
