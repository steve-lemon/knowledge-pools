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

## Stage 5: Retrieve Architecture Baseline

Repository state:

- Retrieve is separated from search, reasoning, verification, and durable update.
- `EvidenceBundle` and `RetrieveToReasonHandoff` are documented.
- Retrieval returns bounded evidence units rather than raw hits or whole source dumps.
- Missing evidence, conflict refs, freshness, version status, and provenance are explicit.
- Retrieval Agent tool permissions are reviewed before moving to reasoning.

Core message:

> Retrieval should return auditable evidence bundles, not just nearby chunks.

Post angles:

- "The retriever should return evidence bundles, not just nearby chunks."
- "Search finds candidates. Retrieve packages usable evidence."
- "A good retrieval result should say what was found, where it came from, which version it belongs to, and what was missing."
- "The retriever should not answer. It should prepare the evidence that makes answering auditable."

Artifacts to include:

- Evidence bundle example.
- Retrieve baseline.
- Retrieve-to-reason handoff.
- Retrieval Agent spec.
- Missing evidence example.
- Conflict refs example.

## Stage 6: Reason Architecture Baseline

Repository state:

- Reasoning produces draft answers or proposed actions from evidence bundles.
- `DraftAnswer`, `ProposedAction`, and `ReasonToVerifyHandoff` are documented.
- Supported claims, assumptions, unknowns, missing evidence, and conflicts are separated.
- Reason output is positioned as verification-ready draft synthesis, not final truth.
- Reasoning Agent tool permissions are reviewed before moving to answer verification.

Core message:

> Reasoning should produce useful cited drafts without certifying itself.

Post angles:

- "Reason is not verification."
- "A draft answer should cite evidence and label assumptions before verification runs."
- "Reasoning should label assumptions before verification checks them."
- "Missing evidence should become an explicit unknown, not an invented answer."
- "Contradictions should be surfaced in the draft, not hidden by synthesis."

Artifacts to include:

- Draft answer with evidence refs.
- Reason-to-verify handoff.
- Reason baseline.
- Reasoning Agent spec.
- Example insufficient evidence answer.
- Conflict handling example.

## Stage 7: Verification Loop

Repository state:

- Answers and relationship proposals are checked against retrieved evidence.
- Unsupported claims are flagged.
- Stale or superseded knowledge is surfaced.

Core message:

> Verification should audit draft reasoning before the system treats it as reliable.

Post angles:

- "The verifier agent asks: which sentence is supported by which evidence?"
- "A grounded answer is not complete until its evidence path can be audited."
- "Contradictions are not errors to hide; they are knowledge to represent."

Artifacts to include:

- Verification report.
- Example unsupported answer.
- Stale evidence warning.
- Contradiction warning.

## Stage 8: Update, Curation, and Evaluation

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
