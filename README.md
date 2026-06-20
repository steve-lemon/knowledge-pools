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

The CLI writes execution verification logs to stderr as inline lines with:

- `timestamp` including milliseconds;
- `level`;
- `event`;
- important `details` such as `taskId`, `runId`, `agentId`, `portId`, `status`, `durationMs`, and `traceRef`.

The summary result payload remains on stdout. Use `--quiet` to disable logs or `--log-level debug|info|warn|error` to adjust verbosity.
In an interactive shell, `info` logs are yellow and `error` logs are red. Set `NO_COLOR=1` to disable ANSI colors.

For direct TypeScript execution during development:

```bash
npm run dev:summary -- fixtures/summary-agent/basic.md
```

To run through OpenAI instead of the mock gateway:

```bash
OPENAI_API_KEY=... npm run summary -- fixtures/summary-agent/basic.md --gateway openai
```

The OpenAI gateway defaults to `gpt-5.4-mini` because this project is testing the user-requested model path.

You can override it:

```bash
OPENAI_API_KEY=... npm run summary -- fixtures/summary-agent/basic.md --gateway openai --model gpt-5.4-mini
```

The prototype uses:

- `LocalStorage`;
- `StorageSummaryReadTool`;
- `MockLlmGateway` or `OpenAiLlmGateway`;
- `InMemoryToolPortRegistry`;
- `SummaryAgent`.

It does not implement the full Knowledge Pools runtime.

The CLI runs `SummaryAgent` through the prototype superclass path and includes `agent_result.trace_refs` in the output.

## Working Principle

This repository should grow as both a system and a notebook. Every major implementation step should leave behind:

1. What was decided.
2. Why it was decided.
3. What evidence or constraint shaped it.
4. What remains uncertain.

Before moving from one major stage to the next, use [Work Context Packs](docs/operations/work-context-packs.md) to choose the relevant files, then update the stage boundary using [Stage Transition Guidelines](docs/operations/stage-transition-guidelines.md).
