# Decision: SummaryAgent Prototype And LLM Gateway Boundary

Date: 2026-06-20
Status: accepted

## Context

The implementation-near specs were moving toward broad tool port and agent definitions.

That risks mixing model-provider calls into agent implementations before the core agent behavior is testable.

## Decision

Keep model-capable agent behavior behind a common `LlmGateway` boundary.

Before defining the full tool pool, validate a small `SummaryAgent` with one storage-backed read tool and one `LlmGateway`:

```text
tool.read(path) -> decode text -> summarize -> summary proof result
```

## Rationale

This keeps the first prototype small and implementation-realistic.

It also makes model providers replaceable and allows deterministic tests with a mock gateway.

## Alternatives

- Let each agent call an LLM provider directly.
- Treat model calls as optional generic tool ports only.
- Delay all LLM contract work until full agent specs.

## Consequences

Agents must depend on the gateway interface, not provider SDKs.

The first prototype can verify storage-backed tool reads, decoding, gateway usage, validation, and result shaping before implementing the full pipeline.

Provider adapters can be added later without changing the agent core contract.

## Follow-ups

- Define the broader tool port contracts after this prototype boundary is accepted.
- Add fixtures for the `SummaryAgent` prototype.
- Decide whether prototype summary artifacts are persisted.
