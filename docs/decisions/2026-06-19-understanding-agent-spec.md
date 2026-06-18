# Decision: Understanding Agent Spec

Date: 2026-06-19
Status: accepted

## Context

The project clarified that `understand` means source/document understanding.

The user asked to detail the Understanding Agent spec.

## Decision

Define the Understanding Agent as a candidate-producing agent that reads ingest artifacts and access units, then emits structured knowledge candidates, ambiguity notes, review requests, quality reports, and traces.

The maintained spec lives under `docs/agents/understanding-agent.md`.

The agent is deterministic-first and must run without a model adapter in v1.

It may optionally use model-assisted extraction, but model output must pass the same validation and evidence-alignment rules.

## Rationale

This gives implementation a concrete task contract and keeps the stage boundary clear.

The agent can improve search and later reasoning without writing durable memory or accepting relationships prematurely.

## Alternatives

- Keep the Understanding Agent as a high-level role only.
- Let the agent write durable knowledge records directly.
- Make model-assisted extraction mandatory from the start.
- Merge user-question understanding into this agent.

## Consequences

The implementation needs:

- task and context envelope schemas;
- local artifact layout;
- structural extractors;
- candidate normalization;
- ambiguity and review artifacts;
- quality report output;
- trace events;
- strict tool permission checks.

## Follow-ups

- Define JSON schemas for understanding artifacts and candidates.
- Implement Markdown/text structural extractors.
- Add local fixture tests for invalid handoffs and missing evidence refs.
