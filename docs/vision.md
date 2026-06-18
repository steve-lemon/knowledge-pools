# Vision

Knowledge Pools is a durable knowledge operating layer for LLM agents.

Most RAG systems answer by retrieving semantically similar chunks. That is useful, but it fails when the system must remember why something was decided, distinguish newer knowledge from older knowledge, resolve contradictory sources, or reuse project-specific context over a long period of time.

Knowledge Pools aims to support a stronger loop:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

## North Star

Build a knowledge repository that can answer with grounded context, preserve uncertainty, and improve after each useful interaction.

## Non-Goals

- Do not build a generic chat wrapper first.
- Do not rely only on vector similarity.
- Do not store every conversation verbatim as durable memory.
- Do not treat generated summaries as equal to source evidence.

## Design Bet

The useful unit of long-term knowledge is often not a chunk. It is a claim, decision, procedure, concept, question, or experiment, each connected to source evidence and time.

The `understand` stage is where the system starts moving from chunks to these meaning units.

It should extract candidates, preserve evidence, and expose ambiguity without prematurely turning interpretation into durable memory.

This `understand` stage means source/document understanding.

Understanding a user's question is handled later as task understanding inside planning and retrieval.
