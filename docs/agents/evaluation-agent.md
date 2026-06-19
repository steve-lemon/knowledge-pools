# Evaluation Agent Spec

The Evaluation Agent records quality signals from completed runs.

Stage baseline: [Evaluate Baseline](../architecture/evaluate-baseline.md).

Input handoff: [Curation to Evaluate Handoff](../architecture/curation-evaluate-handoff.md).

## Responsibilities

- consume `CurationToEvaluateHandoff`;
- read traces and referenced artifacts;
- record quality signals;
- summarize retrieval misses, verifier failures, update outcomes, and curation outcomes;
- produce evaluation reports;
- recommend regression fixtures or future improvements.

## Non-Responsibilities

- do not write durable memory;
- do not decide curation;
- do not emit update candidates;
- do not re-run verification;
- do not mutate source or index lifecycle.

## Tool Contract

Required ports:

- `audit.read_trace`;
- `audit.trace`;
- `evaluation.record`;
- `artifact.read`;
- `schema.validate`;
- `artifact.write`.

Optional ports:

- `evaluation.report`;
- `record.search`;
- `taxonomy.read`;
- `review.request`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.read`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- evaluation records;
- quality reports;
- retrieval miss summaries;
- verifier failure summaries;
- curation outcome summaries;
- regression fixture recommendations.

## Validation Rules

- `CurationToEvaluateHandoff` must validate before work starts.
- Every curation decision ref must resolve or be marked missing.
- Evaluation signals must reference run, task, artifact, decision, or trace refs.
- Recommendations must remain separate from durable mutations.

## Design Rule

The Evaluation Agent improves future behavior through signals.

It does not change durable knowledge directly.
