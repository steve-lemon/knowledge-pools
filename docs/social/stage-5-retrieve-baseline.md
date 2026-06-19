# Stage 5: Retrieve Architecture Baseline

This is the sixth public-facing narrative for Knowledge Pools.

Use this document after the `retrieve` architecture has been clarified but before claiming that reasoning, answer verification, update, or curation are complete.

## Core Thesis

Retrieve is not just search.

For an agent-oriented knowledge repository, retrieve is the stage where a validated retrieval plan becomes an auditable evidence bundle.

The system should not treat search hits, preview artifacts, or similar chunks as final grounding.

It should first resolve:

- which evidence was selected;
- where it came from;
- which source or record version it belongs to;
- which access unit was fetched;
- what was missing;
- whether conflict search found opposing evidence;
- whether the evidence is current, historical, stale, or lifecycle-restricted.

## What Changed

The project now has a clearer retrieve baseline:

- `retrieve` consumes `PlanToRetrieveHandoff`;
- `EvidenceBundle` is the primary artifact;
- `RetrieveToReasonHandoff` defines the contract for `reason`;
- media-specific retrieve concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- `EvidenceItem` is now a canonical term for one selected evidence entry inside an `EvidenceBundle`;
- preview artifacts are explicitly inspection aids, not source truth;
- retrieve tool access is reviewed through the retrieve readiness checklist;
- `retrieval.plan`, `reason.synthesize`, `verification.check`, `candidate.emit`, `memory.write`, and lifecycle mutation tools are forbidden for the retriever.

The important boundary is:

```text
plan = decide what evidence is needed
retrieve = gather and package evidence
reason = synthesize from evidence
verify = audit claims against evidence
```

## Why This Matters

Basic RAG often treats retrieval as:

```text
query -> top-k chunks -> answer
```

That is too loose for long-running knowledge work.

The system needs to know whether a piece of evidence is:

- a Markdown section;
- an image region;
- an OCR span;
- an audio transcript span;
- a video scene segment;
- a PDF page or block;
- a durable decision record;
- a graph relation result;
- missing;
- conflicting;
- stale or superseded.

`retrieve` gives the system a place to turn search candidates into usable evidence.

It makes grounding inspectable before reasoning starts.

## Design Moves

### 1. Search Hits Are Not Evidence Yet

Search returns candidates.

Retrieve resolves, selects, bounds, and packages evidence.

Only then should the next stage treat something as evidence.

### 2. Evidence Must Stay Bounded

Retrieve should fetch sections, pages, regions, transcript spans, frame ranges, or records.

It should not copy whole files or large media objects into the reasoning context by default.

### 3. Provenance Is Part Of The Output

An `EvidenceItem` should preserve:

- evidence ref;
- source ref or record ref;
- source version id;
- access unit ref;
- retrieval step id;
- content ref when a bounded artifact was created;
- preview refs when used for inspection;
- freshness, version, and lifecycle metadata.

### 4. Media Retrieval Needs Different Locators

Markdown, images, audio, video, and PDFs do not ground answers the same way.

Examples:

- Markdown: section or block refs;
- image: region refs, OCR spans, standard rendition basis;
- WAV/audio: transcript spans and time ranges;
- MP4/video: scene segments, subtitle spans, frame ranges, keyframes;
- PDF: pages, blocks, tables, figures, OCR spans.

### 5. Tool Permissions Matter

Required retriever ports:

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
- source write, tombstone, and deletion lifecycle tools.

## First Public Message

The sixth share should not claim that answers are generated or verified yet.

It should say:

> I finished the retrieve architecture baseline. The important lesson is that retrieval should return evidence bundles, not just nearby chunks.

## Suggested Korean Summary

```text
Knowledge Pools의 retrieve 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

retrieve는 단순 검색이 아닙니다.
그리고 답변 생성도 아닙니다.

plan 단계가 "어떤 증거가 필요한가"를 정했다면,
retrieve 단계는 그 계획을 실행해서 실제로 사용할 수 있는 EvidenceBundle을 만듭니다.

즉 흐름은 이렇게 됩니다.

PlanToRetrieveHandoff
-> Retrieval Agent
-> EvidenceBundle
-> RetrieveToReasonHandoff

중요한 점은 search hit가 아직 evidence가 아니라는 것입니다.

검색 결과는 후보일 뿐이고,
retrieve가 source/version/access unit을 resolve하고,
필요한 부분만 bounded fetch하고,
누락된 evidence와 conflict refs까지 명시해야
reason 단계가 신뢰할 수 있는 근거로 사용할 수 있습니다.

미디어별로도 locator가 다릅니다.

- Markdown은 section/block ref
- image는 region/OCR span
- audio는 transcript span/time range
- video는 scene/subtitle/frame range
- PDF는 page/block/table/figure ref

그래서 retrieve의 산출물은 답변이 아니라,
출처와 버전과 경계가 분명한 근거 패키지여야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 retrieve 단계 설계를 정리했습니다.

이번 결론:

retrieve는 단순 검색이 아닙니다.
답변 생성도 아닙니다.

search hit는 아직 evidence가 아닙니다.

retrieve는 검색 후보를 source/version/access unit까지 resolve하고,
필요한 부분만 bounded fetch해서,
EvidenceBundle로 패키징하는 단계입니다.

question
-> plan
-> retrieve
-> evidence bundle
-> reason

Markdown이면 section,
image면 region,
audio면 transcript span,
video면 scene/frame range,
PDF면 page/block처럼
미디어마다 evidence locator가 달라집니다.

좋은 RAG/agent memory는 "가까운 chunk"가 아니라
"감사 가능한 evidence bundle"을 넘겨야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the retrieve architecture baseline for Knowledge Pools.

The main lesson:

retrieve is not just search.
It is not answer generation either.

Search hits are candidates.
Retrieve turns selected candidates into bounded, source-grounded evidence.

The flow is:

PlanToRetrieveHandoff
-> Retrieval Agent
-> EvidenceBundle
-> RetrieveToReasonHandoff

For each selected evidence item, the system should preserve:

- evidence ref
- source or record ref
- source version id
- access unit ref
- retrieval step id
- content ref when bounded evidence was fetched
- freshness/version/lifecycle metadata
- missing evidence and conflict refs when relevant

This matters because media do not ground answers the same way.

Markdown may need a section ref.
An image may need a region ref or OCR span.
Audio may need a transcript span and timestamp.
Video may need a scene segment or frame range.
A PDF may need a page, block, table, or figure ref.

The retriever should not answer.
It should prepare the evidence that makes answering auditable.
```

## Suggested Thread Outline

```text
1. I finished the retrieve architecture baseline for Knowledge Pools.

2. The key distinction:
   search finds candidates.
   retrieve packages usable evidence.

3. A search hit is not evidence yet.
   It still needs source, version, access-unit, freshness, and lifecycle context.

4. The primary artifact is EvidenceBundle.
   It contains EvidenceItems, missing evidence notes, conflict refs, provenance, and trace refs.

5. Media retrieval needs different locators:
   Markdown section
   Image region
   Audio transcript span
   Video scene/frame range
   PDF page/block/table

6. The retriever is forbidden from synthesizing answers, verifying claims, writing memory, or making curation decisions.

7. Next step:
   reason should synthesize from EvidenceBundle without rerunning retrieval or inventing provenance.
```

## Repository References

- `docs/architecture/retrieve-baseline.md`
- `docs/architecture/retrieve-reason-handoff.md`
- `docs/architecture/media-retrieve-concept-proofs.md`
- `docs/architecture/retrieve-readiness-review.md`
- `docs/agents/retrieval-agent.md`
- `docs/architecture/terminology.md`
