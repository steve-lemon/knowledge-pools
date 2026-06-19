# Stage 3: Connect Architecture Baseline

This is the fourth public-facing narrative for Knowledge Pools.

Use this document after the `connect` architecture has been clarified but before claiming a verified or curated knowledge graph.

## Core Thesis

Connect is not graph storage.

For an agent-oriented knowledge repository, connect is the stage where isolated knowledge candidates become evidence-grounded relationship proposals.

The system should not jump from candidates to accepted graph edges.

It should first propose inspectable relationships:

- duplicates;
- supports;
- contradicts;
- depends_on;
- supersedes;
- mentions;
- applies_to.

## What Changed

The project now has a clearer connect baseline:

- the boundary between `understand` and `connect` is explicit;
- `UnderstandToConnectHandoff` defines the input contract;
- `ConnectionArtifact` and `RelationshipProposal` are the main outputs;
- media-specific connect concept proofs are documented;
- candidate/proposal terminology is clarified;
- tool access is reviewed through the connect readiness checklist;
- `graph.query` is optional for v1, while `record.search` is enough for local deterministic proof;
- durable graph and memory mutation tools are forbidden.

The important boundary is:

```text
understand = interpret, extract knowledge units, align evidence
connect = relate candidates to existing records and graph context
verify = check whether proposed relationships and claims are supported
```

## Why This Matters

Basic RAG can retrieve related chunks.

An agentic knowledge system needs to ask a different set of questions:

- Is this candidate new or duplicated?
- Does it support something already known?
- Does it contradict an older decision?
- Does it depend on another concept or procedure?
- Does it supersede stale knowledge?
- Does it only apply to a specific context?

`connect` creates the relationship proposal layer needed to answer those questions.

It makes the system graph-aware without letting the graph mutate itself automatically.

## Design Moves

### 1. Proposal-Level Only

Connect emits `RelationshipProposal`, not durable graph edges.

It can say:

> this candidate may support that record

It should not say:

> this relationship is now accepted

### 2. Endpoint Refs Are Required

Every relationship proposal needs:

- `from_ref`;
- `to_ref`;
- relation type;
- evidence refs;
- taxonomy version;
- confidence;
- rationale or review refs.

### 3. Local First

V1 does not need a graph database.

The first implementation can use:

- local candidate artifacts;
- local record fixtures;
- taxonomy relation rules;
- deterministic matching;
- optional graph query later.

### 4. Media Locators Must Survive

Markdown, image, audio, video, and PDF can all produce relationship proposals.

But the locator must survive:

- Markdown section;
- image OCR span and region;
- audio transcript span;
- video subtitle span and scene;
- PDF page and block.

### 5. Tool Permissions Matter

Connect is graph-aware, not graph-mutating.

Required v1 tool ports:

- `artifact.read`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Forbidden durable mutation ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `rollback.create_event`;
- `delete.create_tombstone`.

## First Public Message

The fourth share should not claim the system has a verified graph.

It should say:

> I finished the connect architecture baseline. The important lesson is that graph edges should be proposed before they are accepted.

## Suggested Korean Summary

```text
Knowledge Pools의 connect 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

connect는 graph 저장 단계가 아닙니다.
그리고 관계를 "확정"하는 단계도 아닙니다.

understand가 source unit에서 claim, decision, concept 같은 지식 후보를 만든다면,
connect는 그 후보가 기존 지식과 어떤 관계일 수 있는지 제안합니다.

예를 들면:

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

중요한 점은 이 출력이 durable graph edge가 아니라
RelationshipProposal이라는 것입니다.

즉 "이 후보는 저 기록을 support하는 것 같다"라고 말할 수는 있지만,
"이 관계는 확정됐다"라고 말하지는 않습니다.

이번 경계는 이렇게 잡았습니다.

understand = interpret, extract knowledge units, align evidence
connect = relate candidates to existing records and graph context
verify = check whether proposed relationships and claims are supported

좋은 agent memory는 graph를 자동으로 오염시키지 않고,
먼저 evidence-grounded relationship proposal을 만든 뒤
verify와 curate를 거쳐야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 connect 단계 설계를 정리했습니다.

이번 결론:

connect는 graph 저장 단계가 아닙니다.
관계를 확정하는 단계도 아닙니다.

understand가 만든 knowledge candidate를 기존 record/candidate/source와 비교해서
다음 관계를 "제안"합니다.

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

출력은 durable graph edge가 아니라 RelationshipProposal입니다.

즉 graph-aware이지만 graph-mutating은 아닙니다.

RAG가 chunk 검색을 넘어가려면,
후보 지식 사이의 관계를 바로 확정하지 말고
검증 가능한 proposal로 먼저 다뤄야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the connect architecture baseline for Knowledge Pools.

The main lesson:

connect is not graph storage.
It is not relationship acceptance either.

If understand turns source units into knowledge candidates, connect proposes how those candidates may relate to existing knowledge:

- duplicates
- supports
- contradicts
- depends_on
- supersedes
- mentions
- applies_to

The output is not a durable graph edge.
It is a RelationshipProposal.

So the system can say:

"this candidate may support that record"

But it should not say:

"this relationship is now accepted"

To move beyond basic RAG, I think we need a proposal layer between extracted candidates and durable graph memory.
```

## Concrete Detail

A minimal relationship proposal:

```json
{
  "proposal_id": "rp_supports_001",
  "relation_type": "supports",
  "status": "candidate",
  "from_ref": "artifact://runs/run_001/understand/candidates/kc_claim_001.json",
  "to_ref": "record://claims/claim_042",
  "evidence_refs": ["src_path_a91c72#section_003"],
  "taxonomy_version": "0.1.0",
  "confidence": 0.72,
  "requires_review": true
}
```

## Open Question

The useful feedback question:

> Where should a system draw the line between deterministic relation matching, semantic similarity, model-assisted proposal, and human review?
