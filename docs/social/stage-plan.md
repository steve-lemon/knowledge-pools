# Social Stage Plan

This plan maps project progress to possible publishable updates.

Use it as a reference only. Do not generate new social content from these stages unless the user explicitly asks for it.

## Stage 0: Foundation

Repository state:

- Documentation structure created.
- Vision, architecture, agent roles, knowledge model, RAG limitations, roadmap, and decision log added.
- Problem recognition and solution approach prepared as the first public narrative.

Core message:

> Basic RAG is useful, but long-running knowledge work needs memory, evidence, conflict handling, temporal reasoning, and verification.

Post angles:

- "RAG retrieves chunks. Long-running work needs claims, decisions, evidence, and uncertainty."
- "The problem is not just retrieval. It is maintaining knowledge over time."
- "A knowledge system should preserve why something was decided, not only where it was mentioned."
- "The first design loop is ingest -> understand -> connect -> retrieve -> reason -> verify -> update."
- "The implementation loop makes plan, curation, and evaluation explicit."

Artifacts to include:

- README link.
- Architecture overview link.
- Problem and approach narrative.
- Simple architecture diagram.

## Stage 1: Ingest Architecture Baseline

Repository state:

- Ingest architecture is clarified.
- Source storage, source versions, manifests, access units, preview artifacts, content-minimal indexing, and ID policy are documented.
- The boundary between `ingest` and `understand` is explicit.

Core message:

> Ingest is not just upload or chunking. It is the source-grounded entry point that preserves evidence before the system tries to understand it.

Post angles:

- "Ingest should preserve evidence before interpretation."
- "The index should help find the source. It should not become the source."
- "A source-grounded agent memory starts with manifests, access units, previews, and deterministic IDs."
- "The first boundary: ingest prepares evidence; understand extracts knowledge candidates."

Artifacts to include:

- Ingest/understand boundary.
- Media concept proof examples.
- Index ID policy.
- Preview artifact policy.

## Stage 2: Understand Architecture Baseline

Repository state:

- Source/document understanding is separated from user-question understanding.
- The Understanding Agent spec is defined.
- Media understand concept proofs are documented.
- Understand outputs are candidate-level artifacts with evidence refs.
- Quality gates are defined before handoff to connect.

Core message:

> Understand is not answer generation. It turns source units into evidence-grounded knowledge candidates.

Post angles:

- "Do not jump from chunks to memory. Create candidates first."
- "Understand should produce claims, decisions, concepts, procedures, questions, and constraints as candidates."
- "Every candidate needs evidence refs."
- "Model-assisted extraction is useful, but the output must still be schema-validated and source-grounded."

Artifacts to include:

- Understanding Agent spec.
- Media understand concept proofs.
- Understand readiness review.
- Minimal knowledge candidate JSON example.
- Ingest-to-understand handoff.

## Stage 3: Connect Architecture Baseline

Repository state:

- The boundary between `understand` and `connect` is explicit.
- `UnderstandToConnectHandoff`, `ConnectionArtifact`, and `RelationshipProposal` are documented.
- Media connect concept proofs are documented.
- Candidate/proposal terminology is clarified.
- Tool permissions are reviewed before implementation.

Core message:

> Connect is not graph storage. It turns isolated candidates into evidence-grounded relationship proposals.

Post angles:

- "Do not jump from candidates to graph edges. Create relationship proposals first."
- "Connect should be graph-aware, not graph-mutating."
- "Contradiction should first be a proposal that can be verified."
- "Tool permissions matter: connect must not receive durable mutation tools."

Artifacts to include:

- Connect baseline.
- Understand-to-connect handoff.
- Media connect concept proofs.
- Connect readiness review.
- Minimal relationship proposal JSON example.

## Stage 4: Plan Architecture Baseline

Repository state:

- Runtime task understanding is assigned to the Retrieval Planner.
- `RetrievalPlan` and `PlanToRetrieveHandoff` are documented.
- Media-specific plan concept proofs are documented.
- Plan tool permissions are reviewed before moving to retrieve.

Core message:

> Retrieval should be planned before searching.

Post angles:

- "User-question understanding belongs in planning, not source understanding."
- "The planner should produce evidence requirements before retrieval runs."
- "Planning should be media-aware, but not media-consuming."
- "Tool permissions matter: the planner must not fetch evidence or synthesize answers."

Artifacts to include:

- Plan baseline.
- Plan-to-retrieve handoff.
- Media plan concept proofs.
- Plan readiness review.
- Minimal retrieval plan JSON example.

## Stage 5: Retrieve, Reason, and Verification Loop

Repository state:

- Retrieval returns evidence bundles rather than raw hits only.
- Reasoning produces draft answers or proposed actions from evidence.
- Answers and relationship proposals are checked against retrieved evidence.
- Unsupported claims are flagged.
- Stale or superseded knowledge is surfaced.

Core message:

> Retrieval is only half the problem. Evidence bundles, reasoning, and verification need explicit boundaries.

Post angles:

- "The retriever should return evidence bundles, not just nearby chunks."
- "Reasoning should label assumptions before verification checks them."
- "The verifier agent asks: which sentence is supported by which evidence?"
- "Contradictions are not errors to hide; they are knowledge to represent."

Artifacts to include:

- Evidence bundle example.
- Draft answer with evidence refs.
- Verification report.
- Example unsupported answer.
- Conflict handling example.

## Stage 6: Update, Curation, and Evaluation

Repository state:

- Useful interactions produce update candidates.
- Curation decides what becomes durable memory or graph state.
- Planner, retriever, reasoner, verifier, and updater agents run as a coordinated workflow.
- Agent traces are stored for evaluation.

Core message:

> The system becomes useful when it can learn from work without turning every chat into permanent memory.

Post angles:

- "Durable memory should be curated, not dumped."
- "The update agent proposes decisions, corrections, constraints, and open questions."
- "The curation agent decides what becomes durable."
- "Agent traces make the system inspectable."

Artifacts to include:

- End-to-end run trace.
- Memory update example.
- Evaluation checklist.
