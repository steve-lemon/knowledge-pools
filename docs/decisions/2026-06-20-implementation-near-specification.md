# Decision: Implementation-Near Specification Before Code

Date: 2026-06-20
Status: accepted

## Context

The architecture loop is now defined through `evaluate`.

The system is broad enough that immediate implementation could turn into accidental infrastructure work, premature media support, or inconsistent stage contracts.

The project currently needs implementation-level precision without yet committing to runtime code.

## Decision

Before building runtime code, prepare an implementation-near specification for the Markdown-first vertical slice.

This specification should define module boundaries, CLI contracts, local store layout, TypeScript-facing schemas, artifact payloads, handoff payloads, tool ports, validation gates, and fixtures.

Actual implementation is deferred until these contracts are precise enough to execute.

## Rationale

The project is intended to design a knowledge architecture that is close to implementable.

The next useful step is therefore not broad code generation.

It is to remove ambiguity from:

- stage ownership;
- object boundaries;
- refs and IDs;
- local persistence;
- tool-port contracts;
- command behavior;
- failure handling;
- regression fixtures.

## Alternatives

Start coding immediately.

This would provide fast feedback, but it risks locking in weak boundaries before the shared contracts are stable.

Keep writing high-level architecture only.

This would preserve flexibility, but it would not answer the concrete questions an implementation needs.

## Consequences

Implementation can later begin with a smaller blast radius.

The Markdown-first MVP remains the implementation target, but the immediate work product is documentation.

Media-specific support remains intentionally deferred.

## Follow-ups

- Complete the CLI command contract spec.
- Complete the Markdown-first type contract spec.
- Complete fixture inputs and expected outputs.
- Recheck the readiness gate before creating runtime code.
