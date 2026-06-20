# Vision

Knowledge Pools is a durable knowledge operating layer for LLM agents.

This repository currently focuses on implementation-near specifications, not a broad production runtime.

Prototype code is intentionally limited to `SummaryAgent` so the project can validate the agent/tool/storage/LLM gateway contracts before broader implementation.

The project boundary is defined in [Project Purpose And Scope](project-purpose-and-scope.md).

Most RAG systems answer by retrieving semantically similar chunks. That is useful, but it fails when the system must remember why something was decided, distinguish newer knowledge from older knowledge, resolve contradictory sources, or reuse project-specific context over a long period of time.

Knowledge Pools aims to support a stronger loop.

The public shorthand is:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

The implementation loop makes planning, curation, and evaluation explicit:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

The canonical stage order is defined in [Ultimate Knowledge Loop](architecture/ultimate-loop.md).

## North Star

Build a knowledge repository that can answer with grounded context, preserve uncertainty, and improve after each useful interaction.

## Non-Goals

- Do not build a generic chat wrapper first.
- Do not rely only on vector similarity.
- Do not store every conversation verbatim as durable memory.
- Do not treat generated summaries as equal to source evidence.
- Do not expand runtime code beyond the `SummaryAgent` prototype until the scope document changes.

## Design Bet

The useful unit of long-term knowledge is often not a chunk. It is a claim, decision, procedure, concept, question, or experiment, each connected to source evidence and time.

The `understand` stage is where the system starts moving from chunks to these meaning units.

It should extract candidates, preserve evidence, and expose ambiguity without prematurely turning interpretation into durable memory.

This `understand` stage means source/document understanding.

Understanding a user's question is handled later as task understanding inside planning and retrieval.
