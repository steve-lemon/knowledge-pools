# Agent Connection Model

This document defines how agents connect to each other without depending on any specific LLM provider.

## Core Principle

Agents should communicate through typed artifacts, not hidden chat history.

The orchestrator owns the workflow, session, context, and traces. Agents receive bounded context and return structured results.

```text
agent A -> artifact -> orchestrator -> context envelope -> agent B
```

## Why Not Pass Raw Conversation

Passing raw conversation between agents creates several problems:

- context windows become unstable;
- one agent's wording becomes another agent's hidden premise;
- provider-specific chat formats leak into the architecture;
- long-running sessions become hard to replay;
- verification cannot easily identify which evidence supported which claim.

Instead, agents should pass durable or semi-durable artifacts.

## Connection Types

### 1. Sequential Handoff

One agent produces an artifact used by the next agent.

Example:

```text
retrieval planner -> retrieval plan -> retrieval agent
retrieval agent -> evidence bundle -> reasoning agent
reasoning agent -> draft answer -> verifier agent
```

### 2. Shared Context Read

Multiple agents read from the same context envelope or memory records.

Example:

```text
reasoning agent reads evidence bundle
verifier agent reads evidence bundle and draft answer
```

### 3. Blackboard

Agents write structured artifacts into a run-local workspace.

Example:

```text
runs/run_01/
  task.json
  retrieval-plan.json
  evidence-bundle.json
  draft-answer.json
  verification.json
  update-candidates.json
```

### 4. Event-Driven Connection

Agents subscribe to typed events.

Example:

```text
source.ingested -> understanding requested
answer.verified -> update candidate requested
update.accepted -> evaluation requested
```

This is useful later, but the first implementation can use direct orchestrator calls.

## Artifact Types

Recommended artifacts:

- `task`
- `context_envelope`
- `source_record`
- `knowledge_record`
- `retrieval_plan`
- `evidence_bundle`
- `draft_answer`
- `verification_report`
- `update_candidate`
- `curation_decision`
- `run_trace`
- `evaluation_report`

Each artifact should have:

- `id`
- `type`
- `schema_version`
- `created_at`
- `created_by`
- `run_id`
- `session_id`
- `provenance`

## Handoff Contract

Every agent handoff should answer:

1. What artifact was produced?
2. Which context was used?
3. Which evidence was cited?
4. What assumptions were made?
5. What should the next agent do?

Example:

```json
{
  "handoff_id": "handoff_01",
  "from_agent": "retrieval_agent",
  "to_agent": "reasoning_agent",
  "artifact_refs": ["evidence_bundle_01"],
  "context_refs": ["context_01"],
  "assumptions": [],
  "next_action": "produce_grounded_answer"
}
```

## Orchestrator Responsibilities

The orchestrator must:

- create run IDs and task IDs;
- load and trim context envelopes;
- call agents in the selected workflow;
- validate artifact schemas;
- store handoff records;
- enforce verification before update;
- keep provider-specific model sessions out of the core architecture.

## Agent Responsibilities

Each agent must:

- accept a typed task;
- declare required context;
- emit typed artifacts;
- cite evidence references where relevant;
- avoid writing durable memory directly;
- emit trace events.

## Anti-Patterns

Avoid:

- agent-to-agent freeform chat as the primary interface;
- passing full conversation history by default;
- relying on provider thread IDs for session memory;
- letting agents mutate global state directly;
- storing model-generated summaries without source links;
- treating the final answer as the only artifact.

## Design Rule

The system should be replayable.

Given the same task, context envelope, artifacts, and model adapter configuration, the run should be inspectable even if the exact model output is not deterministic.

