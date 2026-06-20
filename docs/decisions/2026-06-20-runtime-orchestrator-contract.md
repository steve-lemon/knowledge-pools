# Decision: Runtime And Orchestrator Contract

Date: 2026-06-20
Status: accepted

## Context

After P0 tool ports were defined, the next review-order item was the runtime and
orchestrator contract.

The project must stay specification-first and avoid broad runtime implementation,
but later agent specs need a stable boundary for sessions, runs, tasks, context
envelopes, artifacts, handoffs, traces, tool grants, retries, and failure
propagation.

## Decision

Define the runtime and orchestrator contract in:

```text
docs/specs/modules/runtime-orchestrator.md
```

Keep runtime responsibilities separate from orchestrator responsibilities:

- runtime owns common execution mechanics around `BaseAgent`, tool grants,
  validation, artifact writes, handoffs, and traces;
- orchestrator owns workflow state, session/run/task creation, context assembly,
  stage transitions, and replay inputs.

## Rationale

Separating runtime execution from orchestration prevents stage agents from
inventing incompatible lifecycle behavior.

It also keeps the existing `SummaryAgent` prototype narrow while still allowing
future Markdown-first agents to share one execution contract.

## Alternatives

- Let each agent spec define its own runtime lifecycle.
- Implement a broad orchestrator before detailed stage specs.
- Treat `BaseAgent` prototype behavior as the full runtime contract.

## Consequences

Future agent specs can depend on one common lifecycle:

```text
Task -> ContextEnvelope -> Agent -> Artifact -> Handoff -> next Task
```

The runtime/orchestrator spec can be used as the boundary before defining
stage-specific Markdown agents.

The project still avoids building a production orchestrator until readiness
criteria and fixtures are defined.

## Follow-ups

- Define Markdown-first agent specs by stage using this runtime boundary.
- Decide whether handoffs need dedicated tool ports or remain orchestrator-owned.
- Define validation harness checks for replay, trace completeness, and handoff blocking.
