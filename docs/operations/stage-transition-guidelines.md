# Stage Transition Guidelines

This document defines the required review whenever the project moves from one architecture or implementation stage to the next.

The goal is to prevent stage boundaries from becoming blurry as the system grows.

For the common object model used at each transition, see [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md).

## Core Rule

Before starting a new stage, explicitly define the boundary between:

- the previous stage;
- the current stage;
- the next stage;
- shared artifacts;
- handoff contracts;
- responsibilities that must not cross the boundary.

Do not assume the boundary is obvious.

## Required Boundary Review

Every stage transition should answer these questions:

1. What does the previous stage own?
2. What does the new stage own?
3. What does the previous stage explicitly not do?
4. What does the new stage explicitly not do?
5. What artifact is handed off?
6. What fields are required in that handoff?
7. Which outputs are final records, and which are only candidates?
8. Which data is source evidence, derived preview, generated interpretation, or durable knowledge?
9. Which indexes or projections are allowed at this stage?
10. Which later stage must validate, connect, verify, or curate the output?
11. Which data belongs in `Artifact`, `HandoffEnvelope`, `ContextEnvelope`, `Session`, and `TraceEvent`?
12. Which refs must be resolvable before the next task starts?

## Boundary Checklist

Before moving to a new stage, update or create:

- stage responsibility document;
- handoff artifact schema;
- terminology entries for new artifacts or records;
- implementation plan step;
- decision record when the boundary affects architecture;
- index/storage policy if new projections are introduced;
- validation rules that enforce the boundary.
- object ownership review for context, session, handoff, artifact, and trace.

## Candidate vs Record Rule

The project must distinguish candidates from durable records.

Examples:

- ingest emits shallow candidates;
- understand emits knowledge candidates;
- connect emits relationship proposals;
- verify emits validation results;
- curation creates durable records.

No stage should silently promote its own output into durable knowledge unless that is the explicit responsibility of the stage.

## Evidence Boundary Rule

Every stage that creates generated or interpreted output must preserve source grounding.

Required links:

- source id;
- source version id;
- source manifest ref;
- access unit refs;
- evidence refs;
- taxonomy bundle id and version when taxonomy is involved;
- generator or parser version when derived output is involved.

## Index Boundary Rule

Adding an index projection does not make data durable knowledge.

Index documents are retrieval maps. They must point back to source evidence, derived artifacts, or candidate records.

Before adding an index document type, define:

- index document id policy;
- source link fields;
- content-minimal policy;
- update behavior;
- deletion or supersession behavior;
- whether the projection represents source, candidate, verified record, or durable memory.

## Stage Transition Template

Use this template when starting a new stage:

```markdown
## Boundary Review: {previous_stage} -> {next_stage}

Previous stage owns:

- ...

Next stage owns:

- ...

Previous stage must not:

- ...

Next stage must not:

- ...

Handoff artifact:

- ...

Required handoff fields:

- ...

Candidate vs durable record status:

- ...

Validation needed before moving on:

- ...
```

## Current Example

The first explicit boundary is:

```text
ingest -> understand
```

See [Ingest and Understand Boundary](../architecture/ingest-understand-boundary.md).

The rule from that boundary should be reused for later transitions:

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
```
