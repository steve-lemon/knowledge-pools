# Retrieval Planner Spec

This document defines the detailed v1 contract for the Retrieval Planner.

The Retrieval Planner implements the `plan` stage.

The Retrieval Planner owns task understanding for user questions and workflow requests.

It turns a request into explicit evidence requirements and a retrieval plan.

Its job is to decide what retrieval should do before retrieval starts.

It does not retrieve evidence.

It does not synthesize answers.

It does not write durable memory.

The stage baseline is defined in [Plan Baseline](../architecture/plan-baseline.md).

The required handoff to retrieval is defined in [Plan to Retrieve Handoff](../architecture/plan-retrieve-handoff.md).

## Responsibilities

The planner owns:

- interpreting user or workflow request intent;
- identifying expected answer shape;
- identifying freshness scope;
- identifying required evidence types;
- deciding whether conflict search is required;
- choosing retrieval strategy steps;
- setting retrieval budget or limits;
- marking missing prerequisites;
- validating the retrieval plan schema;
- emitting `PlanToRetrieveHandoff`;
- emitting trace events.

The planner does not own:

- fetching full source evidence;
- ranking retrieved evidence;
- synthesizing answers;
- verifying answer claims;
- creating relationship proposals;
- writing durable memory.

## Expected Results

The planner should produce:

- `RetrievalPlan`;
- task understanding metadata;
- required evidence types;
- freshness scope;
- conflict-search requirement;
- expected answer shape;
- retrieval budget or limits;
- missing prerequisite notes;
- `PlanToRetrieveHandoff`;
- trace events.

The planner is successful when the Retrieval Agent can execute the plan without reinterpreting the raw user request.

## Tool Contract

Required ports:

- `retrieval.plan`;
- `record.search`;
- `index.search`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `taxonomy.read`;
- `model.complete`;
- `artifact.read`;
- `preview.lookup`.

Forbidden ports:

- `source.read`;
- `retrieval.fetch_evidence`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `retrieval-plan.json`;
- task understanding metadata;
- freshness constraints;
- required evidence types;
- expected answer shape;
- `PlanToRetrieveHandoff`;
- trace events.

## Handoff Target

The planner hands off to the Retrieval Agent through `PlanToRetrieveHandoff`.

The handoff must include:

- retrieval plan ref;
- required evidence types;
- freshness scope;
- conflict-search requirement;
- validation status;
- trace refs.

## Design Rule

The Retrieval Planner understands the user task.

It does not understand source documents into knowledge candidates.

It does not search for evidence.
