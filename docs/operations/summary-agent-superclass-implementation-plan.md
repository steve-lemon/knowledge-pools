# SummaryAgent Superclass Implementation Plan

This plan explains how to move the current `SummaryAgent` sample from direct dependency injection to the shared agent superclass pattern.

The goal is not to expand runtime scope.

The goal is to make the existing `SummaryAgent` sample validate:

- `AgentTask`;
- `ContextEnvelope`;
- `ToolPortRegistry`;
- tool permission checks;
- artifact output;
- trace events;
- model gateway replacement.

## Implementation Status

Status: implemented for the current prototype.

Implemented files:

- `src/runtime/agent-contracts.ts`;
- `src/runtime/base-agent.ts`;
- `src/runtime/tool-port-registry.ts`;
- `src/runtime/in-memory-tool-port-registry.ts`;
- `src/tools/ports/summary-read-port.ts`;
- `src/tools/ports/llm-summarize-port.ts`;
- `src/tools/ports/schema-validate-port.ts`;
- `src/tools/ports/artifact-write-port.ts`;
- `src/tools/ports/audit-trace-port.ts`;
- `src/agents/summary-agent.ts`;
- `src/cli/summary.ts`.

The CLI now creates `AgentTask`, `ContextEnvelope`, and `InMemoryToolPortRegistry`, then runs `SummaryAgent` through `BaseAgent.run(...)`.

## Current Gap

The current TypeScript sample works, but it is closer to unit mode:

```text
SummaryAgent
  -> readTool.read(...)
  -> llmGateway.summarize(...)
  -> SummaryProofResult
```

This proves the storage and gateway adapters work.

It does not yet prove the superclass architecture.

The architecture target is runtime mode:

```text
AgentTask + ContextEnvelope + ToolPortRegistry
  -> BaseAgent.run(...)
  -> SummaryAgent.execute(...)
  -> ports.call("summary.read", ...)
  -> ports.call("llm.summarize", ...)
  -> ports.call("schema.validate", ...)
  -> ports.call("artifact.write", ...)
  -> ports.call("audit.trace", ...)
  -> AgentResult<SummaryProofResult>
```

## Target Design

`SummaryAgent` should become a prototype agent implemented through the same runtime shape that later agents will use.

Target properties:

- `stage: "prototype"`;
- `agentId: "summary_agent"`;
- required ports: `summary.read`, `llm.summarize`, `schema.validate`, `artifact.write`, `audit.trace`;
- optional ports: `llm.describe_capabilities`, `artifact.read`;
- forbidden ports: durable source/index/memory/curation mutations;
- no normal handoff by default;
- output artifact type: `summary_proof_result`;
- optional feasibility artifact type: `summary_feasibility_report`.

## Implementation Phases

### Phase 1: Runtime Contract Types

Add code-facing TypeScript contracts that mirror the architecture docs.

Files:

- `src/runtime/agent-contracts.ts`
- `src/runtime/tool-port-registry.ts`

Types:

- `StageName`;
- `AgentName`;
- `ArtifactType`;
- `AgentTask<TInput>`;
- `AgentConstraints`;
- `ContextEnvelope`;
- `Artifact<TPayload>`;
- `ArtifactMeta`;
- `AgentResult<TOutput, THandoff>`;
- `AgentToolset`;
- `ToolPortRegistry`.

Rules:

- TypeScript fields use `camelCase`.
- Persisted JSON output remains `snake_case`.
- Keep this minimal; only include fields needed by `SummaryAgent`.

### Phase 2: BaseAgent Skeleton

Add a minimal superclass implementation.

File:

- `src/runtime/base-agent.ts`

Responsibilities:

- validate task stage and agent id;
- validate required tool grants;
- reject forbidden tool grants;
- call `execute`;
- return `AgentResult`;
- preserve typed errors.

Non-goals:

- no full orchestrator;
- no real session store;
- no durable run replay yet.

### Phase 3: In-Memory ToolPortRegistry

Add a local registry that maps port ids to handlers.

File:

- `src/runtime/in-memory-tool-port-registry.ts`

Expected ports for the prototype:

- `summary.read`;
- `llm.summarize`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

The registry should:

- enforce that called ports are allowed by the task;
- normalize thrown errors into typed tool failures;
- optionally collect trace-like records in memory.

### Phase 4: Tool Adapters

Wrap existing direct dependencies behind port handlers.

Files:

- `src/tools/ports/summary-read-port.ts`;
- `src/tools/ports/llm-summarize-port.ts`;
- `src/tools/ports/schema-validate-port.ts`;
- `src/tools/ports/artifact-write-port.ts`;
- `src/tools/ports/audit-trace-port.ts`.

Mapping:

| Port | Implementation |
| --- | --- |
| `summary.read` | delegates to `StorageSummaryReadTool` |
| `llm.summarize` | delegates to `MockLlmGateway`, `NoopLlmGateway`, or `OpenAiLlmGateway` |
| `schema.validate` | minimal prototype validator |
| `artifact.write` | in-memory or optional local JSON write |
| `audit.trace` | in-memory trace collector |

### Phase 5: Split SummaryAgent Core

Separate pure summary shaping from runtime execution.

Suggested split:

- `SummaryAgentCore`: pure logic for decode, bound, hash, and result shaping;
- `SummaryAgent`: extends `BaseAgent` and calls ports;
- direct dependency mode becomes a test helper, not the main runtime path.

The runtime `SummaryAgent` should not call:

- `readTool.read(...)` directly;
- `llmGateway.summarize(...)` directly.

It should call:

```ts
await ports.call("summary.read", request)
await ports.call("llm.summarize", request)
```

### Phase 6: CLI Runtime Mode

Update CLI wiring to create:

- `AgentTask<SummarizePathInput>`;
- `ContextEnvelope`;
- `InMemoryToolPortRegistry`;
- port handlers;
- `SummaryAgent`;
- `AgentResult`.

The CLI should still output the current summary proof JSON for usability.

It may additionally include:

- `agent_result`;
- `artifact_ref`;
- `trace_refs`;
- `tool_call_count`.

Keep mock as the default gateway.

OpenAI remains opt-in with:

```bash
OPENAI_API_KEY=... npm run summary -- fixtures/summary-agent/basic.md --gateway openai
```

### Phase 7: Verification

Required checks:

```bash
npm run typecheck
npm run build
npm run summary -- fixtures/summary-agent/basic.md
```

Expected behavior:

- mock gateway still succeeds;
- noop gateway fails as a model/tool failure;
- missing file fails as a `summary.read` failure;
- OpenAI gateway remains user-run because it requires network and API key.

## Acceptance Criteria

The refactor is complete when:

- `SummaryAgent` extends or conforms to `BaseAgent`;
- `SummaryAgent` receives `AgentTask`, `ContextEnvelope`, and `ToolPortRegistry`;
- `SummaryAgent` calls `summary.read` and `llm.summarize` through `ports.call`;
- required/forbidden tool grants are enforced;
- output is wrapped in `AgentResult`;
- summary proof remains available as the payload artifact;
- CLI still works with mock gateway;
- OpenAI gateway remains selectable;
- direct dependency mode is clearly labeled as unit-test support.

## Deferred

Do not add these during the superclass refactor:

- full orchestrator;
- session persistence;
- durable artifact store;
- full JSON Schema validator;
- multi-agent handoff;
- ingest/understand stage implementation;
- production OpenSearch;
- broad media support.

## Main Design Decision

`SummaryAgent` should prove the architecture by using the same runtime contract as future agents.

Direct dependency injection remains useful for unit tests, but the default executable path should be superclass + tool registry mode.
