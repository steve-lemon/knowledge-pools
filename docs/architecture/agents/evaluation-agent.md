# Evaluation Agent Spec

The Evaluation Agent records quality signals from completed runs.

## Tool Contract

Required ports:

- `audit.read_trace`;
- `evaluation.record`;
- `artifact.read`.

Optional ports:

- `evaluation.report`;
- `record.search`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- evaluation records;
- quality reports;
- retrieval miss summaries;
- verifier failure summaries.

## Design Rule

The Evaluation Agent improves future behavior through signals.

It does not change durable knowledge directly.
