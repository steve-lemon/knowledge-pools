# Agent Design

This document defines the initial agent roles for Knowledge Pools.

## Ingestion Agent

Converts raw inputs into normalized source records.

Inputs:

- Markdown
- PDF
- text notes
- code repositories
- web pages
- conversations selected for preservation

Outputs:

- source metadata
- parsed document structure
- candidate chunks
- source fingerprints

## Understanding Agent

Transforms parsed sources into reusable knowledge units.

Outputs:

- claims
- decisions
- concepts
- procedures
- open questions
- summaries
- evidence links

The Understanding Agent should separate source-grounded statements from model-generated interpretation.

## Retrieval Planner

Turns a user question or agent task into a retrieval strategy.

Responsibilities:

- Identify required knowledge types.
- Choose vector, keyword, graph, temporal, or source retrieval.
- Prefer recent decisions when the user asks about current state.
- Search for contradicting evidence when the answer may be contested.

## Reasoning Agent

Synthesizes an answer or action plan from retrieved evidence.

Responsibilities:

- Distinguish facts, assumptions, and unknowns.
- Cite supporting knowledge records.
- Avoid hiding conflicts.
- Keep answers aligned with the user's current task.

## Verifier Agent

Checks whether an answer is grounded in the retrieved evidence.

Checks:

- Is each key claim supported?
- Are stale sources presented as current?
- Were known contradictions ignored?
- Is uncertainty represented honestly?

## Knowledge Update Agent

Writes durable knowledge back into the repository after useful interactions.

Candidates for storage:

- decisions
- corrected facts
- reusable preferences
- project constraints
- failed approaches
- open questions

The update agent should prefer concise structured records over full transcripts.

