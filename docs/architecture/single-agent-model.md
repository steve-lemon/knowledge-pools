# Single Agent Model

This document defines one agent as a deterministic system component with optional model calls.

The design goal is LLM-independent orchestration. An agent may use an LLM, a rules engine, a parser, a search service, or a human review step, but the surrounding system should not depend on any one model provider's chat session semantics.

## Definition

An agent is a bounded worker that:

1. Receives a typed task.
2. Reads only the context envelope it is given or explicitly allowed to fetch.
3. Uses tools through declared ports.
4. Produces a typed result.
5. Emits trace events.
6. Does not own durable session state.

```text
task envelope
  -> agent runtime
  -> tools and model adapter
  -> typed result
  -> trace events
```

## Agent Boundary

Each agent has four explicit boundaries.

### 1. Input Contract

The task passed into the agent.

Example:

```json
{
  "task_id": "task_01",
  "run_id": "run_01",
  "agent": "retrieval_planner",
  "intent": "answer_question",
  "input": {
    "question": "Why does Knowledge Pools need verification?"
  },
  "context_refs": ["ctx_project_knowledge_pools"],
  "constraints": {
    "freshness": "latest",
    "require_evidence": true
  }
}
```

### 2. Context Envelope

The bounded context available for the task.

The context envelope contains references and selected excerpts, not unlimited conversation history.

Contents:

- session summary
- active task state
- relevant memory records
- evidence bundle
- allowed source references
- constraints
- output schema

### 3. Tool Ports

The agent accesses capabilities through stable ports.

Examples:

- `source.read`
- `record.search`
- `graph.query`
- `memory.lookup`
- `model.complete`
- `verification.check`
- `trace.emit`

The ports are stable even if the implementation changes.

### 4. Output Contract

The result must be structured and machine-readable.

Example:

```json
{
  "task_id": "task_01",
  "status": "completed",
  "result": {
    "plan_type": "hybrid_retrieval",
    "retrieval_steps": [
      {
        "mode": "keyword",
        "query": "verification"
      },
      {
        "mode": "record",
        "record_types": ["decision", "claim"]
      }
    ]
  },
  "context_updates": [],
  "trace_refs": ["trace_01"]
}
```

## Internal Agent Loop

A single agent can follow a small internal loop:

```text
accept task -> inspect context -> choose action -> call tools -> produce result -> emit trace
```

The agent should not silently mutate global state.

If it wants to update durable memory, it must return a candidate update for the curation gate.

## LLM Independence

LLM calls are optional implementation details behind a model adapter.

The agent contract should not include:

- provider-specific message formats
- provider session identifiers
- hidden chat state
- model-specific tool call objects
- unstructured prompt-only outputs

Instead, the system owns:

- task IDs
- run IDs
- session IDs
- context envelopes
- schemas
- trace records
- durable memory

## Model Adapter

When an agent needs an LLM, it calls a generic model port.

```text
model.complete(request) -> model_response
```

The request should contain:

- system instruction
- task instruction
- context envelope
- output schema
- model preferences

The response should contain:

- structured output
- raw provider metadata
- token or cost metadata when available
- safety or refusal metadata when available

Provider-specific details stay inside the adapter.

## Agent State

Agents can use temporary working state during one task, but they should not own long-lived memory.

Allowed:

- temporary notes
- intermediate tool results
- local retry state
- validation errors

Not allowed:

- hidden durable chat memory
- provider-owned session state as the source of truth
- implicit assumptions that are not emitted in the result or trace

## Error Handling

Agent errors should be typed.

Recommended error classes:

- `invalid_input`
- `missing_context`
- `tool_failure`
- `model_failure`
- `schema_validation_failure`
- `insufficient_evidence`
- `conflict_detected`
- `permission_required`

## Design Rule

An agent is replaceable if another implementation can satisfy the same input contract, use the same ports, and return the same output contract.

