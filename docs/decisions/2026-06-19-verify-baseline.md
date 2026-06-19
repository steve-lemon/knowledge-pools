# Decision: Verify Baseline

Date: 2026-06-19

Status: Accepted

## Context

The project defined `connect` as a relationship proposal stage.

The next stage must audit those proposals before any graph edge or durable memory can be accepted.

The existing Verifier Agent spec focused on answer verification, but the architecture also needs relationship proposal verification.

## Decision

Define the `verify` stage as an evidence audit stage with at least two modes:

- `verify_relationships`;
- `verify_answer`.

Start v1 with `verify_relationships`, consuming `ConnectToVerifyHandoff` and producing `VerificationReport`.

Verification results are audit outcomes. They are not durable graph writes.

## Consequences

Positive:

- relationship proposals can be audited before curation;
- unsupported, stale, and uncertain proposals become visible;
- the same Verifier Agent can later audit answers;
- durable graph mutation remains outside verification.

Tradeoffs:

- v1 must define verification report schemas before graph storage;
- relationship verification may initially be conservative;
- full answer verification waits for retrieval and reasoning stages.
