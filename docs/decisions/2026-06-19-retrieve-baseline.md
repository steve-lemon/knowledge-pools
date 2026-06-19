# Decision: Retrieve Baseline

Date: 2026-06-19
Status: accepted

## Context

The `plan` stage now produces `RetrievalPlan` and `PlanToRetrieveHandoff`.

The next stage must execute that plan without reinterpreting the user request or synthesizing answers.

## Decision

Define the `retrieve` stage baseline.

The Retrieval Agent will:

- consume `PlanToRetrieveHandoff`;
- load a validated `RetrievalPlan`;
- execute allowed retrieval steps;
- resolve source, record, graph, preview, and access-unit refs;
- fetch bounded evidence units when required;
- emit `EvidenceBundle`;
- emit `RetrieveToReasonHandoff`;
- report missing evidence and conflicts explicitly.

It will not:

- reinterpret task intent;
- synthesize final answers;
- verify answer claims;
- create candidates or relationship proposals;
- mutate durable memory or lifecycle state.

## Rationale

Retrieval should not return raw hits only.

It should return evidence that reasoning and verification can inspect later.

## Consequences

Positive:

- reasoning can cite stable evidence refs;
- verification can audit the same evidence bundle;
- media retrieval can remain bounded by page, region, timestamp, segment, or access-unit refs;
- missing evidence becomes explicit.

Tradeoffs:

- retrieval needs stricter provenance metadata;
- evidence bundle schemas must be validated before reasoning starts.

## Follow-ups

- Add retrieve media concept proofs.
- Define reason baseline.
- Expand answer verification after retrieve and reason are designed.
