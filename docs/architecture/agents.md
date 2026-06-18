# Agent Design

This document defines the initial agent roles for Knowledge Pools.

For the lower-level contract of a single agent, see [Single Agent Model](single-agent-model.md).

For agent handoffs and workflow connections, see [Agent Connection Model](agent-connection-model.md).

For context and session persistence, see [Context and Session Model](context-session-model.md).

For shared tool ports and stage-scoped tool permissions, see [Agent Tool Pool](agent-tool-pool.md).

## Design Principle

Agents communicate through typed artifacts and context envelopes.

They should not depend on hidden LLM chat state, provider-hosted threads, or raw conversation history as the source of truth.

## Ingestion Agent

Converts raw inputs into normalized, source-grounded ingest artifacts.

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
- access units
- preview artifact refs
- source fingerprints
- taxonomy category assignments
- shallow candidates from visible structure

## Understanding Agent

Transforms parsed sources into reusable knowledge units.

It reads ingest artifacts and exact source access units. It should separate parser-visible structure from semantic interpretation.

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

Outputs:

- retrieval plan
- required evidence types
- freshness constraints
- conflict search requirements
- expected answer shape

## Retrieval Agent

Executes the retrieval plan across available retrieval services.

Responsibilities:

- Run source lookup, keyword search, vector search, graph traversal, and temporal filtering as needed.
- Return evidence bundles rather than raw search results only.
- Mark missing evidence and possible conflicts.

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

## Curation Agent

Decides whether proposed updates should become durable memory.

Responsibilities:

- Accept, edit, defer, or reject candidate updates.
- Ensure each durable update has provenance.
- Avoid storing noisy conversation fragments.
- Preserve supersession instead of overwriting older knowledge silently.

## Evaluation Agent

Records quality signals from completed runs.

Responsibilities:

- Track retrieval misses.
- Track verifier failures.
- Track stale or conflicting evidence usage.
- Record user corrections.
- Identify patterns that should improve future retrieval and verification.
