# Decision: Ingestion Agent Spec

Date: 2026-06-19
Status: accepted

## Context

The project already defined ingest architecture, media ingest strategy, source version policy, and the shared agent tool pool.

The user noted that the Ingestion Agent spec had not been detailed while the Understanding Agent spec had been.

## Decision

Define the Ingestion Agent spec under `docs/agents/ingestion-agent.md`.

The Ingestion Agent is responsible for preserving and structuring evidence:

- source records;
- source versions;
- source manifests;
- access units;
- preview refs;
- taxonomy category assignments;
- shallow candidates;
- ingest artifacts;
- validation reports;
- traces.

It must not create durable semantic knowledge records.

## Rationale

Separating the Ingestion Agent spec from the high-level agent map makes implementation clearer.

It also keeps the ingest-to-understand boundary enforceable: ingest prepares evidence, while understand creates semantic knowledge candidates.

## Alternatives

- Keep Ingestion Agent as a section inside `agents.md`.
- Delay the spec until implementation.
- Let Ingestion Agent perform semantic extraction directly.

## Consequences

The implementation needs:

- an ingest task contract;
- source/version write paths;
- deterministic Markdown/text parser;
- source manifest and access-unit schemas;
- validation report output;
- trace events;
- handoff to the Understanding Agent.

## Follow-ups

- Define JSON schemas for source records, source versions, manifests, access units, and ingest artifacts.
- Implement Markdown/text ingestion first.
- Add fixture tests for unstable access-unit IDs and missing source refs.
