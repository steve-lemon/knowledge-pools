# Retrieval Planner Spec

The Retrieval Planner owns task understanding for user questions and workflow requests.

It turns a request into a retrieval plan.

## Tool Contract

Required ports:

- `retrieval.plan`;
- `record.search`;
- `index.search`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `taxonomy.read`;
- `schema.validate`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `retrieval-plan.json`;
- task understanding metadata;
- freshness constraints;
- required evidence types;
- expected answer shape.

## Design Rule

The Retrieval Planner understands the user task.

It does not understand source documents into knowledge candidates.
