# Context and Session Model

This document defines how Knowledge Pools maintains context and sessions across agents in an LLM-independent way.

For the full data boundary between `Session`, `Run`, `Task`, `ContextEnvelope`, `Artifact`, `HandoffEnvelope`, and `TraceEvent`, see [Stage Data Flow Contract](stage-data-flow-contract.md).

## Core Principle

The system owns session state. The LLM does not.

Provider chat sessions, assistant threads, or model-specific memory features may be used as optimizations, but they must never be the source of truth.

## Key Concepts

### Session

A user or workflow continuity boundary.

Examples:

- one interactive user session
- one project planning session
- one background ingestion session

Session records contain:

- `session_id`
- `created_at`
- `updated_at`
- `owner`
- `project_refs`
- `active_goals`
- `summary_refs`
- `run_refs`

### Run

One execution of a workflow inside a session.

Examples:

- answer a question
- ingest a folder
- verify an answer
- update memory

Run records contain:

- `run_id`
- `session_id`
- `workflow_type`
- `status`
- `input_refs`
- `artifact_refs`
- `trace_refs`
- `started_at`
- `completed_at`

### Task

One unit of work assigned to one agent.

Task records contain:

- `task_id`
- `run_id`
- `agent_id`
- `input`
- `context_refs`
- `output_refs`
- `status`

### Context Envelope

A bounded, explicit context package passed into an agent.

The context envelope is assembled by the orchestrator for each task.

Context is not the handoff between stages.

Handoffs declare what moves forward. Context envelopes declare what one task is allowed to see.

Recommended fields:

```json
{
  "context_id": "ctx_01",
  "session_id": "session_01",
  "run_id": "run_01",
  "task_id": "task_01",
  "purpose": "task_context",
  "summary": "Short session summary.",
  "active_goal": "Define agent connection model.",
  "instructions": [],
  "memory_refs": [],
  "artifact_refs": [],
  "evidence_refs": [],
  "constraints": {},
  "excluded_context": []
}
```

## Context Layers

Use layered context instead of one large prompt.

### 1. System Policy Context

Stable rules for the application.

Examples:

- output must be structured;
- cite evidence when making claims;
- do not write durable memory directly.

### 2. Project Context

Durable project information.

Examples:

- architecture decisions;
- active roadmap;
- repository conventions.

### 3. Session Context

Continuity within a user session.

Examples:

- current goal;
- recent decisions;
- session summary;
- open questions.

### 4. Run Context

Artifacts created during one workflow run.

Examples:

- retrieval plan;
- evidence bundle;
- draft answer;
- verification report.

### 5. Task Context

The minimum context needed for one agent task.

Examples:

- specific input;
- required schema;
- constraints;
- relevant excerpts.

## Context Assembly

The orchestrator assembles context in this order:

1. Load task input.
2. Load active session summary.
3. Load relevant project memory.
4. Load required artifacts from the current run.
5. Retrieve additional evidence if allowed.
6. Apply token or size budget.
7. Emit a context envelope.

The final context envelope should be stored or reproducible from stored references.

## Session Maintenance

Sessions should be maintained through explicit records:

- session summaries;
- active goals;
- open questions;
- durable memory refs;
- recent run refs.

Do not depend on:

- hidden provider threads;
- invisible chat memory;
- model-specific assistant state;
- unlogged prompt history.

## Summarization Strategy

Long sessions require summaries, but summaries are lossy.

Use a layered summary strategy:

- rolling session summary for continuity;
- decision records for durable choices;
- open question records for unresolved work;
- artifact references for exact evidence;
- run traces for audit.

The summary should point to records instead of replacing them.

## Context Budgeting

Every agent task should define a context budget.

Budgeting rules:

- Prefer exact evidence over broad summaries.
- Prefer recent accepted decisions over old drafts.
- Include conflict candidates when relevant.
- Include source identifiers even when excerpts are trimmed.
- Record excluded context when omission may matter.

## Session Persistence Layout

Initial local layout:

```text
knowledge/
  sessions/
    session_01.json
  runs/
    run_01/
      run.json
      tasks/
      artifacts/
      traces.jsonl
  memory/
    project.jsonl
    decisions.jsonl
    open-questions.jsonl
```

## LLM-Independent Provider Use

If a provider offers hosted threads or memory, use them only as caches.

Required rule:

```text
system session state -> provider request
provider response -> system artifacts and traces
```

Never:

```text
provider thread -> hidden source of truth
```

## Design Rule

Context is not whatever fits in the prompt.

Context is an explicit, versioned, inspectable package that the system assembles for a task.

Session is continuity.

Context is bounded working memory for one task.
