# Decision: Schema, Artifact, And Audit Tool Ports

Date: 2026-06-20
Status: accepted

## Context

The tool-port checklist still had P0 runtime support ports undefined after the
source, document-structure, and preview specs were split into meaning groups.

The remaining P0 ports are required before runtime and orchestrator contracts can
depend on a stable validation, artifact, and trace boundary:

- `schema.validate`;
- `artifact.read`;
- `artifact.write`;
- `audit.trace`.

## Decision

Define `schema.validate`, `artifact.read`, `artifact.write`, and `audit.trace`
in one implementation-near spec:

```text
docs/specs/tools/schema-artifact-audit-tool-ports.md
```

Treat these ports as P0 runtime support ports.

## Rationale

These ports are tightly coupled:

- agents validate output before artifact writes;
- artifacts preserve validated payloads and provenance;
- trace events record tool calls, validation, and artifact refs;
- runtime replay and handoff checks need artifact and trace refs to be stable.

Keeping them in one spec makes the validation and execution audit path easier to
review before runtime/orchestrator contracts are written.

## Alternatives

- Define each port in a separate spec.
- Put artifact ports in the source store spec.
- Wait for runtime/orchestrator contracts before defining audit trace.

## Consequences

The runtime/orchestrator spec can now depend on stable contracts for validation,
artifact read/write, and trace append behavior.

Prototype implementations may remain in-memory for `SummaryAgent`, but they must
stay behind the same port IDs and result shapes.

## Follow-ups

- Define `taxonomy.read` and `taxonomy.validate` after P0 tool ports are stable.
- Define index, retrieval, and verification ports before full Markdown-first loop specs.
- Decide later whether handoffs need dedicated read/write ports or can initially
  reuse artifact-like storage behavior.
