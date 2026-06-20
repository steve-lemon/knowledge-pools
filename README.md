# Knowledge Pools

Knowledge Pools is an agent-oriented knowledge repository designed to go beyond basic LLM RAG.

The goal is not just to retrieve document chunks. The goal is to maintain a living knowledge system that can ingest sources, extract claims, connect evidence, reason across time, detect conflicts, and preserve reusable decisions.

This repository is scoped as an implementation-near specification project.

It should not grow into a broad runtime implementation yet.

Prototype code is limited to `SummaryAgent`, which exists to validate the agent, tool, storage, and LLM gateway contracts.

## Core Direction

- Treat knowledge as structured claims, decisions, concepts, procedures, and evidence.
- Preserve original sources and make every important answer traceable.
- Combine vector search, keyword search, graph traversal, and temporal reasoning.
- Use agents for ingestion, planning, retrieval, reasoning, verification, update candidates, curation, and evaluation.
- Record architecture decisions as the system evolves.

## Documentation Map

- [Documentation Index](docs/README.md)
- [Architecture Index](docs/architecture/README.md)
- [Agent Specs](docs/agents/README.md)
- [Work Context Packs](docs/operations/work-context-packs.md)
- [Decision Log](docs/decisions/README.md)
- [Social Content Guide](docs/social/README.md)

Core entry points:

- [Vision](docs/vision.md)
- [Project Purpose And Scope](docs/project-purpose-and-scope.md)
- [Ultimate Knowledge Loop](docs/architecture/ultimate-loop.md)
- [Terminology](docs/architecture/terminology.md)
- [Implementation Specification Architecture](docs/architecture/implementation-spec-architecture.md)
- [Implementation Plan](docs/operations/implementation-plan.md)
- [Implementation-Near Specification Preparation](docs/operations/implementation-near-spec.md)

## SummaryAgent Prototype

This repository includes a small TypeScript prototype only for architecture validation.

Install dependencies and run the local mock summary flow:

```bash
npm install
npm run build
npm run summary -- fixtures/summary-agent/basic.md
```

For direct TypeScript execution during development:

```bash
npm run dev:summary -- fixtures/summary-agent/basic.md
```

The prototype uses:

- `LocalStorage`;
- `StorageSummaryReadTool`;
- `MockLlmGateway`;
- `SummaryAgent`.

It does not implement the full Knowledge Pools runtime.

## Working Principle

This repository should grow as both a system and a notebook. Every major implementation step should leave behind:

1. What was decided.
2. Why it was decided.
3. What evidence or constraint shaped it.
4. What remains uncertain.

Before moving from one major stage to the next, use [Work Context Packs](docs/operations/work-context-packs.md) to choose the relevant files, then update the stage boundary using [Stage Transition Guidelines](docs/operations/stage-transition-guidelines.md).
