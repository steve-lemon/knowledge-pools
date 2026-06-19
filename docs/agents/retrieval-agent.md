# Retrieval Agent Spec

This document defines the detailed v1 contract for the Retrieval Agent.

The Retrieval Agent implements the `retrieve` stage.

It executes a validated retrieval plan and returns evidence bundles.

It does not reinterpret the user request.

It does not synthesize answers.

It does not write durable memory.

The stage baseline is defined in [Retrieve Baseline](../architecture/retrieve-baseline.md).

The required handoff to reasoning is defined in [Retrieve to Reason Handoff](../architecture/retrieve-reason-handoff.md).

## Responsibilities

The agent owns:

- loading and validating `PlanToRetrieveHandoff`;
- loading the referenced `RetrievalPlan`;
- executing allowed retrieval steps;
- resolving source, record, graph, preview, and access-unit refs;
- fetching bounded evidence units when required;
- preserving freshness and version metadata;
- preserving conflict search results when requested;
- emitting missing evidence notes;
- writing `EvidenceBundle`;
- emitting `RetrieveToReasonHandoff`;
- emitting trace events.

The agent does not own:

- task understanding;
- changing retrieval intent silently;
- synthesizing answers;
- verifying answer claims;
- creating candidates or relationship proposals;
- writing durable memory.

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `index.search`;
- `record.search`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `preview.lookup`;
- `taxonomy.read`;
- `model.embed`.

Forbidden ports:

- `retrieval.plan`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `evidence-bundle.json`;
- missing evidence notes;
- conflict candidates when available;
- `RetrieveToReasonHandoff`;
- trace events.

## Handoff Target

The Retrieval Agent hands off to the Reasoning Agent through `RetrieveToReasonHandoff`.

The handoff must include:

- evidence bundle ref;
- evidence refs;
- missing evidence notes;
- conflict refs;
- validation status;
- trace refs.

## Design Rule

The Retrieval Agent gathers evidence.

It does not synthesize final answers or update memory.
