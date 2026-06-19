# Stage 4: Plan Architecture Baseline

This is the fifth public-facing narrative for Knowledge Pools.

Use this document after the `plan` architecture has been clarified but before claiming that retrieval, reasoning, or answer verification are complete.

## Core Thesis

Plan is not retrieval.

For an agent-oriented knowledge repository, plan is the stage where a user request becomes explicit evidence requirements and a retrieval strategy.

The system should not jump from a question directly to similarity search.

It should first decide:

- what the user is trying to accomplish;
- what answer shape is expected;
- what evidence types are required;
- whether freshness matters;
- whether conflicts or superseded knowledge must be searched;
- which retrieval paths should run;
- what retrieval budget or media bounds should apply.

## What Changed

The project now has a clearer plan baseline:

- `plan` owns runtime task understanding;
- source `understand` and task understanding are explicitly separate;
- `RetrievalPlan` is the primary artifact;
- `PlanToRetrieveHandoff` defines the input contract for `retrieve`;
- media-specific plan concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- tool access is reviewed through the plan readiness checklist;
- `source.read`, `retrieval.fetch_evidence`, `reason.synthesize`, `verification.check`, and `candidate.emit` are forbidden for the planner.

The important boundary is:

```text
plan = translate task into evidence requirements and retrieval strategy
retrieve = execute retrieval paths and gather evidence
reason = synthesize from evidence
```

## Why This Matters

Basic RAG often starts with:

```text
question -> vector search -> answer
```

That can work for simple lookup, but it struggles when the task needs:

- current vs historical evidence;
- decision recall;
- contradiction search;
- source audit;
- media-specific evidence such as page refs, OCR spans, transcript spans, keyframes, or table regions;
- bounded retrieval for large documents, audio, or video.

`plan` gives the system a place to think before it searches.

It makes retrieval strategy inspectable instead of hidden inside a prompt or embedding query.

## Design Moves

### 1. Task Understanding Belongs To Plan

`understand` means source/document understanding.

Runtime user-question understanding belongs to `plan`.

This prevents the system from mixing source processing with query-time intent analysis.

### 2. Evidence Requirements Come First

The planner emits required evidence types before retrieval.

Examples:

- `markdown_section`;
- `decision_record`;
- `image_region`;
- `ocr_span`;
- `transcript_span`;
- `subtitle_span`;
- `pdf_page`;
- `table_region`.

### 3. Media-Aware, Not Media-Consuming

The planner can be media-aware.

It can ask for:

- page refs;
- region refs;
- timestamp ranges;
- keyframes;
- previews;
- transcript spans.

But it must not fetch full source content.

Full evidence fetching belongs to `retrieve`.

### 4. Tool Permissions Matter

Required planner ports:

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
- durable memory, curation, lifecycle, and deletion tools.

## First Public Message

The fifth share should not claim that retrieval or reasoning are implemented.

It should say:

> I finished the plan architecture baseline. The important lesson is that retrieval should be planned before searching.

## Suggested Korean Summary

```text
Knowledge Pools의 plan 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

plan은 retrieval이 아닙니다.
그리고 답변 생성도 아닙니다.

plan은 사용자의 요청을 바로 검색어로 던지는 대신,
먼저 "어떤 증거가 필요한가"를 구조화합니다.

예를 들면:

- 사용자의 의도는 무엇인가?
- 어떤 형태의 답변이 필요한가?
- 최신 정보가 필요한가, 역사적 맥락이 필요한가?
- decision, claim, source section, transcript span, PDF page 중 무엇이 필요한가?
- contradiction search가 필요한가?
- 큰 PDF, audio, video라면 어디까지 bounded fetch해야 하는가?

즉 흐름은 이렇게 됩니다.

question -> task understanding -> evidence requirements -> retrieval plan -> retrieve

여기서 중요한 경계는:

plan = evidence requirement와 retrieval strategy를 만든다
retrieve = 실제 evidence를 가져온다
reason = evidence로 답변을 만든다

이렇게 나누면 retrieval이 blind similarity search가 되는 것을 줄일 수 있습니다.

특히 Markdown, image, WAV, MP4, PDF처럼 미디어마다 필요한 evidence locator가 다르기 때문에,
plan 단계는 media-aware해야 하지만 media-consuming하면 안 된다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 plan 단계 설계를 정리했습니다.

이번 결론:

plan은 retrieval이 아닙니다.
답변 생성도 아닙니다.

plan은 사용자의 질문을 바로 검색으로 보내기 전에,
"어떤 증거가 필요한가"를 구조화합니다.

question
-> task understanding
-> evidence requirements
-> retrieval plan
-> retrieve

예를 들어 PDF라면 page/section/table refs가 필요할 수 있고,
audio라면 transcript span과 timestamp가 필요할 수 있고,
image라면 OCR span과 region ref가 필요할 수 있습니다.

즉 plan은 media-aware해야 하지만,
full source를 가져오는 media-consuming 단계는 아닙니다.

좋은 RAG/agent memory는 검색 전에 먼저 무엇을 찾아야 하는지 결정해야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the plan architecture baseline for Knowledge Pools.

The main lesson:

plan is not retrieval.
It is not answer generation either.

The plan stage turns a user request into explicit evidence requirements and a retrieval strategy before search begins.

question
-> task understanding
-> evidence requirements
-> retrieval plan
-> retrieve

This matters because different tasks need different evidence:

- decision recall may need decisions + supporting claims
- conflict checks need opposing or superseded evidence
- PDFs may need page, section, table, or citation refs
- audio may need transcript spans and timestamps
- images may need OCR spans and region refs
- video may need subtitle spans, keyframes, or scene ranges

So the planner should be media-aware, but not media-consuming.

It can decide what evidence is needed.
It should not fetch full sources, synthesize answers, verify claims, or write memory.

To move beyond basic RAG, I think retrieval needs a planning layer before search.
```

## Concrete Detail

A minimal retrieval plan:

```json
{
  "plan_type": "decision_recall",
  "task_understanding": {
    "intent": "answer_question",
    "answer_shape": "short_explanation_with_evidence",
    "freshness_scope": "stable",
    "requires_conflict_search": true
  },
  "required_evidence_types": [
    "decision_record",
    "claim_candidate",
    "markdown_section"
  ],
  "retrieval_steps": [
    {
      "mode": "keyword_search",
      "query": "OpenSearch full source text retrieval projections"
    },
    {
      "mode": "record_search",
      "record_kinds": ["decision", "claim"]
    }
  ],
  "constraints": {
    "max_evidence_refs": 8,
    "prefer_current": true
  }
}
```

## Open Question

The useful feedback question:

> Where should a retrieval planner stop: intent and evidence requirements only, or should it also choose concrete queries, indexes, and budgets?

## Related Docs

- [Plan Baseline](../architecture/plan-baseline.md)
- [Plan to Retrieve Handoff](../architecture/plan-retrieve-handoff.md)
- [Media Plan Concept Proofs](../architecture/media-plan-concept-proofs.md)
- [Plan Readiness Review](../architecture/plan-readiness-review.md)
- [Retrieval Planner Spec](../agents/retrieval-planner.md)
