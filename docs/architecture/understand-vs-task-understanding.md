# Understand vs Task Understanding

This document clarifies a naming ambiguity in Knowledge Pools.

The word `understand` can mean two different things:

1. understanding stored source material;
2. understanding a user's question or task.

In this architecture, the pipeline stage named `understand` means source understanding.

User question understanding belongs to task understanding and retrieval planning.

## Short Answer

`understand` is primarily related to document/source indexing.

It converts ingested source material into evidence-grounded knowledge candidates that can later be connected, indexed, retrieved, verified, and curated.

User question understanding is a separate runtime concern.

It converts a user request into task intent, constraints, retrieval needs, freshness needs, and expected answer shape.

Both share schemas, taxonomy, evidence refs, and tool-port patterns, but they are not the same stage.

## Two Different Flows

### Source Understanding Flow

This is the current `understand` stage.

```text
source
  -> ingest
  -> understand
  -> knowledge candidates
  -> connect
  -> retrievable knowledge fabric
```

Purpose:

- read source-grounded ingest artifacts;
- extract candidate claims, decisions, concepts, procedures, questions, constraints, and bounded summaries;
- attach evidence refs;
- expose ambiguity;
- prepare candidates for connection and later indexing.

This flow usually happens when documents are imported or reprocessed.

### Task Understanding Flow

This happens when a user asks a question or gives an instruction.

```text
user request
  -> task understanding
  -> retrieval plan
  -> retrieve
  -> reason
  -> verify
```

Purpose:

- identify user intent;
- identify required evidence types;
- detect time scope such as current, historical, or latest;
- detect required answer shape;
- decide whether contradiction, source audit, or decision lookup is needed;
- produce a retrieval plan.

This flow happens at query time.

## Relationship To Indexing

`understand` is related to indexing, but it is not only "indexing."

The distinction:

| Concern | Ingest | Understand | Index |
| --- | --- | --- | --- |
| Preserve source bytes | Yes | No | No |
| Create access units | Yes | Reads | No |
| Extract semantic candidates | No, except obvious markers | Yes | No |
| Store candidate artifacts | No | Yes | Points to them |
| Store full source truth | No | No | No |
| Make candidates searchable | No | Prepares fields | Yes |
| Decide durable truth | No | No | No |

OpenSearch may index understand-stage candidates as projections.

But the source of truth remains:

- source objects;
- manifests;
- access units;
- understanding artifacts;
- candidate artifacts.

The index helps find them. It does not replace them.

## Relationship To User Questions

User questions should not directly invoke source `understand` by default.

When a user asks a question, the system should first do task understanding and planning:

```text
question -> intent/constraint analysis -> retrieval plan
```

Only if the planner discovers that needed sources have not been understood should it request a background source-understanding job.

Example:

```text
user asks: "What decisions did this PDF imply?"
planner sees: PDF ingested but no decision candidates exist
system action: schedule understand job for that source, then retrieve candidates
```

## Shared Parts

Source understanding and task understanding can share:

- taxonomy bundle;
- schema validation;
- context envelope;
- tool pool;
- ambiguity notes;
- review requests;
- trace events;
- model adapter contract.

They should not share:

- artifact type;
- lifecycle responsibility;
- durable memory writes;
- hidden LLM chat state.

## Naming Rule

Use these terms consistently:

| Term | Meaning |
| --- | --- |
| `understand` | Source/document understanding stage |
| `UnderstandingArtifact` | Output of source understanding |
| `knowledge_candidate` | Candidate extracted from source evidence |
| `task_understanding` | Runtime interpretation of user request |
| `retrieval_plan` | Output of task understanding and planning |
| `question_candidate` | A question found inside source material, not necessarily a user's runtime question |

## Design Rule

Document understanding prepares the knowledge fabric.

Task understanding decides how to use the knowledge fabric for a user request.
