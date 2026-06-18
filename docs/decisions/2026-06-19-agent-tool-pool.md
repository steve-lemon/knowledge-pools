# Decision: Agent Tool Pool

Date: 2026-06-19
Status: accepted

## Context

The architecture defines agent roles, single-agent contracts, and LLM-independent handoffs.

The user noted that each agent stage will need tools and asked to organize them as a shared tool pool first.

## Decision

Define a shared agent tool pool based on stable tool ports.

Agents receive stage-scoped permission to use ports.

Tool implementations may change, but the port contracts should remain stable.

Tool calls must be traceable and should declare side effect levels:

- `read_only`;
- `derive`;
- `propose`;
- `mutate_projection`;
- `mutate_durable`;
- `external_effect`.

The `understand` stage is limited to read, derive, and propose tools.

It cannot write durable memory, decide curation, tombstone sources, or perform rollback.

## Rationale

A shared tool pool avoids duplicating capabilities per agent and keeps stage boundaries enforceable.

It also preserves LLM independence because agents call system-owned ports instead of provider-specific tools or hidden chat sessions.

## Alternatives

- Let each agent define private tools.
- Expose all tools to all agents.
- Depend on model-provider tool calling as the core contract.
- Delay tool design until implementation.

## Consequences

The implementation needs:

- tool port definitions;
- stage-based tool permission checks;
- tool trace events;
- side effect level enforcement;
- schema validation for tool inputs and outputs.

## Follow-ups

- Define concrete V1 tool schemas.
- Add tool fixtures for `understand`.
- Add permission checks in the orchestrator.
- Add trace validation for model-assisted tools.
