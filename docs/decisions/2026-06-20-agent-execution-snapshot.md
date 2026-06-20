# Decision: Agent Execution Snapshot

Date: 2026-06-20
Status: accepted

## Context

Agent runs need enough inspection data to support prototype validation,
debugging, evaluation, and later replay without embedding full request payloads
or provider-specific details into the base agent result.

The project also needs a small place to attach cost information, but pricing
policy and billing reconciliation are not stable enough to become part of the
base runtime contract.

## Decision

Every agent result may include an abstract `ExecutionSnapshot`.

The snapshot records run/task/session identity, stage and agent identity,
timestamps, terminal status, input/context/artifact/handoff/trace refs, granted
tool ports, constraints, inspection refs, and optional usage metadata.

Usage metadata may include only `estimatedCost?` at the base contract level.
Detailed token breakdowns, request and response summaries, provider metadata,
diagnostics, or pricing details must live in artifacts, traces, or referenced
inspection records.

## Rationale

This keeps every run inspectable while preserving the existing ref-first
architecture.

The base runtime should answer "what happened and where can I inspect more?"
It should not become a full execution dump, billing ledger, or provider audit
log.

## Alternatives

- Store full request and response payloads directly on `AgentResult`.
  This was rejected because it risks leaking source content, secrets, and
  provider-specific data.
- Put all inspection data only in trace events.
  This was rejected because callers need a compact run-level snapshot attached
  to the agent result.
- Define full cost accounting now.
  This was rejected because provider pricing and billing policy should remain
  implementation-specific until real adapters need it.

## Consequences

- Prototype runs can expose execution snapshots immediately.
- Evaluation agents can detect missing snapshots as quality warnings.
- Future runtimes can add richer inspection records without changing the base
  result shape.
- Cost information remains approximate unless a later pricing contract defines
  stronger rules.

## Follow-ups

- Define durable inspection record storage when replay fixtures require it.
- Decide whether production `audit.trace` should persist snapshot creation and
  cost-estimation events separately.
- Revisit provider-specific cost estimation when real LLM adapters are used in
  regression runs.
