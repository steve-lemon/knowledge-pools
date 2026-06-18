# Decision: LLM-Independent Agent Context and Session Model

Date: 2026-06-18
Status: accepted

## Context

The project is moving from high-level knowledge loops toward concrete agent architecture. Before implementation, the system needs a clear model for a single agent, agent-to-agent connections, and session/context maintenance.

The user explicitly requested that this model avoid dependence on any specific LLM provider.

## Decision

Define agents as bounded components that communicate through typed artifacts and context envelopes.

The orchestrator owns:

- sessions;
- runs;
- tasks;
- context assembly;
- handoffs;
- traces;
- durable memory.

LLM providers are accessed only through adapters. Provider-specific chat sessions, threads, or memory features must not become the source of truth.

## Rationale

This makes the system:

- replayable;
- inspectable;
- provider-independent;
- easier to test;
- safer for long-running memory;
- less vulnerable to hidden context drift.

## Alternatives

- Let agents talk to each other through freeform chat.
- Use provider-hosted threads as durable session memory.
- Pass full conversation history to every agent.
- Build directly on one model provider's tool-call format.

## Consequences

The architecture requires more explicit schemas and orchestration, but gains portability and auditability. The first implementation should focus on session, run, task, context envelope, artifact, and trace records before advanced agent behavior.

## Follow-ups

- Add schemas for session, run, task, context envelope, and artifacts.
- Adjust the implementation plan so the first skeleton includes session and run storage.
- Ensure every agent output can be validated without provider-specific parsing.

