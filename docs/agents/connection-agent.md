# Connection Agent Spec

The Connection Agent implements the `connect` stage.

It relates knowledge candidates to existing records, concepts, sources, and other candidates.

## Purpose

The Connection Agent turns isolated candidates into relationship proposals.

```text
KnowledgeCandidate[]
  -> ConnectionAgent
  -> ConnectionArtifact
  -> relation proposals
```

## Tool Contract

Required ports:

- `record.search`;
- `graph.query`;
- `taxonomy.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `model.complete`;
- `schema.validate`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `ConnectionArtifact`;
- relation candidates;
- duplicate candidates;
- support, contradiction, dependency, and supersession proposals;
- ambiguity or review requests when relationships are uncertain.

## Design Rule

The Connection Agent proposes relationships.

It does not accept relationships as durable truth.
