# Implementation Specs Index

This directory is for implementation-near specifications.

Specs here should be detailed enough for code to be written later, but this directory does not contain runtime code.

Use [Implementation Specification Architecture](../architecture/implementation-spec-architecture.md) as the organizing reference.

Use [Specification Review Checklist](../operations/spec-review-checklist.md) to track detailed review progress.

## Folder Plan

```text
docs/specs/
  modules/
  commands/
  contracts/
  agents/
  tools/
  stores/
  fixtures/
  media/
  validation/
```

Create these subfolders when the first spec in each category is written.

## Spec Categories

| Category | Purpose |
| --- | --- |
| `modules/` | Cross-cutting runtime module specs such as orchestrator, IDs, refs, errors, and validation. |
| `commands/` | CLI command contracts and examples. |
| `contracts/` | TypeScript-facing data contracts and JSON-compatible schemas. |
| `agents/` | Implementation-facing agent specs derived from `docs/agents/`. |
| `tools/` | Tool port contracts and adapter behavior. |
| `stores/` | Filesystem, artifact, source, trace, taxonomy, and index projection store contracts. |
| `fixtures/` | Markdown fixture definitions and expected outputs. |
| `media/` | Image, PDF, audio, and video extension contracts after Markdown-first validation is stable. |
| `validation/` | Schema, ref, trace, handoff, and regression validation rules. |

## Spec Template

```text
# Spec: Name

## Purpose
## Scope
## Non-Goals
## Owned Responsibilities
## Dependencies
## Public Interfaces
## TypeScript Types
## Classes Or Functions
## Input Contracts
## Output Contracts
## Side Effects
## Tool Ports
## Validation Rules
## Failure Modes
## Trace Events
## Fixtures
## Acceptance Criteria
## Open Questions
```

## Rule

Architecture documents explain why the system is shaped this way.

Spec documents explain exactly what an implementation must satisfy.
