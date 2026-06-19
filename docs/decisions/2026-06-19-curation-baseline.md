# Decision: Curation Baseline

Date: 2026-06-19
Status: accepted

## Context

The update stage now emits `UpdateCandidate` artifacts and `UpdateToCurationHandoff`.

The next architectural boundary must define when proposed changes become durable knowledge.

## Decision

Define `curation` as the durable memory gate.

Curation consumes update candidates, emits `CurationDecision` artifacts, and may create durable records or lifecycle updates when a candidate is accepted, edited, superseded, retracted, quarantined, or tombstoned.

Markdown/text candidates are the first implementation scope.

## Rationale

This keeps memory growth governed.

It also preserves a clean boundary between proposing a change and accepting it as durable knowledge.

## Alternatives

- Let update write durable memory directly.
- Treat every verified claim as automatically accepted.
- Delay all curation until a manual-only future workflow.

These options either make memory noisy, blur audit boundaries, or block the system from learning.

## Consequences

- Durable memory writes are allowed only behind curation decisions.
- Accepted records must preserve provenance.
- Supersession and retraction are traceable state changes, not silent overwrites.
- Rollback, quarantine, deletion, and evaluation have a clearer source of truth.

## Follow-ups

- Detail curation readiness review and tool permissions.
- Define media curation concept proofs.
- Define curation-to-evaluate handoff before moving to evaluation.
