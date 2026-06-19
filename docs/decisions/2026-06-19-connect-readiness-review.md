# Decision: Connect Readiness Review

Date: 2026-06-19

Status: Accepted

## Context

The project defined the `connect` baseline, media connect concept proofs, and candidate/proposal terminology.

Before implementation, the stage needs a final tool-access and readiness review because `connect` is graph-aware but must not mutate durable graph state.

## Decision

Define a `Connect Readiness Review`.

The review makes `record.search` required for v1 and keeps `graph.query` optional until graph storage or projected graph fixtures are available.

The required v1 tool ports are:

- `artifact.read`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Forbidden durable mutation ports must be blocked before execution.

## Consequences

Positive:

- v1 can be implemented with local files and deterministic matching;
- the Connection Agent remains graph-aware without requiring a graph database;
- durable graph mutation remains impossible in `connect`;
- tool grants become auditable before implementation.

Tradeoffs:

- graph-neighborhood matching is optional until `graph.query` is backed by an implementation;
- early relation proposals may be conservative;
- broader graph traversal waits for later infrastructure.
