# Reasoning Agent Spec

This document defines the detailed v1 contract for the Reasoning Agent.

The Reasoning Agent implements the `reason` stage.

It synthesizes a draft answer or proposed action from an evidence bundle.

It does not retrieve evidence.

It does not verify claims.

It does not write durable memory.

The stage baseline is defined in [Reason Baseline](../architecture/reason-baseline.md).

The required handoff to verification is defined in [Reason to Verify Handoff](../architecture/reason-verify-handoff.md).

## Responsibilities

The agent owns:

- loading and validating `RetrieveToReasonHandoff`;
- loading the referenced `EvidenceBundle`;
- reading bounded evidence artifacts by ref;
- drafting supported claims from evidence;
- labeling assumptions and unknowns;
- preserving missing evidence and conflicts;
- producing `DraftAnswer` or `ProposedAction`;
- emitting `ReasonToVerifyHandoff`;
- emitting trace events.

The agent does not own:

- task understanding;
- retrieval planning;
- broad evidence retrieval;
- claim verification;
- durable memory updates;
- curation decisions.

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `source.read`;
- `model.complete`;
- `reason.synthesize`;
- `record.search`.

Forbidden ports:

- `retrieval.plan`;
- `index.search`;
- `retrieval.fetch_evidence`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `DraftAnswer` or `ProposedAction`;
- assumptions;
- unresolved questions;
- cited evidence refs;
- confidence notes;
- `ReasonToVerifyHandoff`;
- trace events.

## Handoff Target

The Reasoning Agent hands off to the Verifier Agent through `ReasonToVerifyHandoff`.

The handoff must include:

- draft answer or proposed action ref;
- evidence bundle ref;
- claim refs;
- assumption refs;
- cited evidence refs;
- missing evidence notes;
- conflict refs;
- validation status;
- trace refs.

## Design Rule

The Reasoning Agent explains from evidence.

It does not verify itself or write durable knowledge.
