# Decision: Sample EvaluationAgent For Prototype Runtime Validation

Date: 2026-06-20
Status: accepted

## Context

The repository scope keeps broad runtime implementation out of bounds and names
`SummaryAgent` as the only planned sample implementation.

After adding a prototype runtime orchestrator, we needed a small way to validate
that one agent's result can become another agent's input without implementing
the full canonical `evaluate` stage.

## Decision

Add a sample `EvaluationAgent` only for prototype validation.

It evaluates a completed `SummaryAgent` result and emits a bounded evaluation
report artifact.

This sample remains in the `prototype` stage and must not be treated as the full
canonical `evaluate` stage implementation.

## Rationale

The sample verifies the core orchestration idea:

```text
SummaryAgent result
  -> PrototypeRuntimeOrchestrator
  -> EvaluationAgent
  -> evaluation report artifact
```

It proves intermediate result passing, tool grant validation, artifact writing,
schema validation, and audit traces with minimal code.

## Alternatives

- Wait for full stage-agent specs before testing multi-agent dispatch.
- Implement the complete `evaluate` stage.
- Keep the prototype limited to a single `SummaryAgent` dispatch.

## Consequences

The prototype can now validate a two-agent execution path while still avoiding
production runtime scope.

The sample EvaluationAgent must not read sources, perform retrieval, verify
claims, write memory, decide curation, or mutate indexes.

## Follow-ups

- Keep the sample report focused on SummaryAgent artifacts, traces, and validation.
- Define the real Markdown-first `EvaluationAgent` later through stage-agent specs.
- Add regression fixtures only after fixture and validation harness specs are ready.
