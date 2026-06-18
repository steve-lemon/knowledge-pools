# Decision: Agent Superclass Contract

Date: 2026-06-19

Status: Accepted

## Context

Knowledge Pools uses multiple agents across the loop:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curate -> evaluate
```

Each agent needs different implementation logic, but all agents need the same operational guarantees:

- typed task input;
- bounded context;
- tool-port permission checks;
- typed artifact output;
- validation;
- trace events;
- typed handoff to the next stage.

Without a common contract, every agent would invent its own task shape, output schema, and handoff format.

## Decision

Define a shared `Agent Superclass Contract`.

The contract includes:

- `AgentTask`;
- `ContextEnvelope`;
- `Artifact`;
- `AgentResult`;
- `HandoffEnvelope`;
- `AgentError`;
- `TraceEvent`;
- `AgentSpec`;
- `BaseAgent` reference sketch;
- stage-specific handoff payload map.

The superclass contract does not own stage-specific semantics.

Each agent spec still defines its own:

- accepted input payload;
- output artifact payload;
- evidence semantics;
- quality metrics;
- validation rules;
- next-stage handoff payload.

## Consequences

Positive:

- agents become easier to replace;
- orchestration can stay LLM-independent;
- handoffs become schema-validatable;
- common tracing and validation can be implemented once;
- stage boundaries become easier to enforce.

Tradeoffs:

- the first implementation needs a small runtime layer before agent-specific work;
- some payload types will evolve as each stage becomes concrete;
- TypeScript types must eventually be paired with runtime validation.

## Implementation Note

The first implementation should use TypeScript types as the developer contract and add runtime schema validation before any handoff is accepted by the orchestrator.
