# Decision: Understand vs Task Understanding

Date: 2026-06-19
Status: accepted

## Context

The user asked whether `understand` is related to document indexing, user questions, or both.

The word can be ambiguous because both documents and user requests need interpretation.

## Decision

Use `understand` to mean source/document understanding.

It converts source-grounded ingest artifacts into knowledge candidates.

Use `task_understanding` for runtime interpretation of user questions or instructions.

Task understanding belongs to retrieval planning.

## Rationale

Separating the terms prevents the document-processing pipeline from being confused with query-time planning.

It also keeps source understanding reusable: once documents are understood into candidates, many future user questions can use those candidates.

## Alternatives

- Use `understand` for both source processing and query interpretation.
- Rename source understanding to indexing.
- Let user questions trigger source understanding directly every time.

## Consequences

The implementation should define:

- `UnderstandingArtifact` for source understanding;
- `TaskUnderstanding` or intent-analysis artifact for runtime questions;
- `RetrievalPlan` as the output of task understanding and planning;
- clear handoff between source understanding outputs and query-time retrieval.

## Follow-ups

- Define task understanding schema in the retrieval planning stage.
- Clarify CLI behavior when a user query depends on sources that have been ingested but not yet understood.
