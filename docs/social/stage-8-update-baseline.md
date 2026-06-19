# Stage 8: Update Architecture Baseline

This is the ninth public-facing narrative for Knowledge Pools.

Use this document after the `update` architecture has been clarified but before claiming that curation, durable memory, rollback, deletion, or evaluation are complete.

## Core Thesis

Update is not memory write.

For an agent-oriented knowledge repository, update is the stage where verified work becomes reviewable learning proposals.

The system should be able to learn from useful runs, but it should not turn every chat, answer, correction, or media interpretation into permanent memory.

The key question is:

```text
What did this run reveal that may be reusable, and should curation inspect it?
```

## What Changed

The project now has a clearer update baseline:

- `update` consumes `VerifyToUpdateHandoff`;
- `UpdateCandidate` is the primary artifact;
- `UpdateToCurationHandoff` carries candidates forward;
- empty update runs are valid when no reusable learning signal exists;
- Markdown-first update candidates are the first implementation target;
- media-specific update concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- `update signal`, `selection_reason`, and `media_basis` are canonical terms;
- update tool access is reviewed through the update readiness checklist;
- memory writes, curation decisions, source reads, retrieval, verification checks, lifecycle mutation, rollback, and deletion tools are forbidden.

The important boundary is:

```text
verify = audit support, freshness, conflict, and uncertainty
update = propose reusable memory changes
curation = decide what becomes durable
```

## Why This Matters

Basic RAG often has no learning loop.

It answers, forgets, and repeats the same mistakes.

Naive agent memory often has the opposite problem:

it stores too much.

The update stage is the middle path.

It asks whether a verified outcome should become a candidate for future durable knowledge.

Examples:

- a verified reusable claim;
- a user correction;
- a project decision;
- a reusable procedure;
- a failed approach;
- an open question;
- a stale-knowledge warning;
- a contradiction that needs review.

The output is not memory.

It is a proposal for curation.

## Design Moves

### 1. Update Produces Candidates, Not Memory

Update emits:

- `UpdateCandidate`;
- update quality report;
- review requests;
- `UpdateToCurationHandoff`;
- trace events.

It does not accept candidates.

It does not write durable memory.

It does not mutate source lifecycle or index projections.

### 2. Empty Update Is Valid

If a run has no reusable learning signal, update should say so.

No candidate is better than noisy memory.

### 3. Unsupported Claims Do Not Become Facts

Unsupported or uncertain verification results may become:

- `open_question`;
- `needs_more_evidence`;
- `needs_review`;
- no candidate.

They should not become `verified_claim`.

### 4. Markdown-First Update Comes First

The first implementation target is Markdown/text:

```text
VerificationReport
-> verified Markdown claim
-> UpdateCandidate
-> UpdateToCurationHandoff
```

Only after this works should image, PDF, audio, and video update candidates expand.

### 5. Media Update Is Conservative

Examples:

- Markdown: verified section or block claim;
- image: region/OCR/label review candidate;
- WAV/audio: transcript span candidate with review when needed;
- MP4/video: scene/subtitle/transcript candidate with review;
- PDF: page/block/table candidate only when verified text access units exist.

Uncertain media interpretation should become review or open question, not memory.

### 6. Tool Permissions Matter

Required update ports:

- `artifact.read`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `review.request`;
- `curation.propose`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `source.read`;
- `index.search`;
- `retrieval.fetch_evidence`;
- `verification.check`;
- source lifecycle mutation;
- rollback and deletion lifecycle tools.

## First Public Message

The ninth share should not claim that durable memory is implemented.

It should say:

> I finished the update architecture baseline. The important lesson is that update should create reviewable memory candidates, not write memory directly.

## Suggested Korean Summary

```text
Knowledge Pools의 update 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

update는 memory write가 아닙니다.
curation도 아닙니다.

verify가 claim/proposal/action을 감사해서
VerificationReport를 만들었다면,
update는 그 결과 중에서
"다음에도 재사용할 만한 학습 신호"를 고릅니다.

그리고 바로 저장하지 않고
UpdateCandidate로 만듭니다.

흐름은 이렇게 됩니다.

VerifyToUpdateHandoff
-> Knowledge Update Agent
-> UpdateCandidate[]
-> UpdateToCurationHandoff

중요한 점은 빈 update도 정상이라는 것입니다.

재사용할 학습 신호가 없다면,
아무 candidate도 만들지 않는 편이
noisy memory보다 낫습니다.

Markdown-first MVP에서는 먼저
검증된 Markdown claim, user correction, open question, stale warning 정도만
update candidate로 다룹니다.

image, audio, video, PDF는
각 미디어의 verified evidence locator가 안정화된 이후 확장합니다.

좋은 agent memory는 모든 대화를 저장하는 것이 아니라,
검증된 결과를 review 가능한 후보로 만든 뒤,
curation을 통해 durable memory로 승격해야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 update 단계 설계를 정리했습니다.

이번 결론:

update는 memory write가 아닙니다.
curation도 아닙니다.

verify가 만든 VerificationReport를 바탕으로,
재사용할 만한 학습 신호만 골라
UpdateCandidate로 만드는 단계입니다.

출력은 durable memory가 아니라:

- UpdateCandidate
- update quality report
- review request
- UpdateToCurationHandoff
- trace events

빈 update도 정상입니다.

배울 것이 없는 run이라면 아무것도 저장하지 않는 편이
noisy memory보다 낫습니다.

좋은 agent memory는 모든 대화를 기억하는 것이 아니라,
검증된 결과를 후보로 만들고,
curation을 통해 durable memory로 승격해야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the update architecture baseline for Knowledge Pools.

The main lesson:

update is not memory write.
It is not curation either.

Update consumes verification results and turns useful learning signals into reviewable candidates:

VerifyToUpdateHandoff
-> Knowledge Update Agent
-> UpdateCandidate[]
-> UpdateToCurationHandoff

The output is not durable memory.

It is a proposal for curation.

This matters because basic RAG often forgets everything after answering, while naive agent memory stores too much.

The update stage is the middle path:

- verified reusable claims
- user corrections
- project decisions
- reusable procedures
- failed approaches
- open questions
- stale warnings
- contradictions needing review

For the Markdown-first MVP, only verified Markdown/text evidence should produce fact-like candidates.

Media-derived updates stay conservative until their evidence locators and verification paths are reliable.

No candidate is also a valid result.

Empty update is better than noisy memory.
```

## Suggested Thread Outline

```text
1. I finished the update architecture baseline for Knowledge Pools.

2. The key distinction:
   update is not memory write.
   It produces candidates, not durable memory.

3. The flow:
   VerificationReport
   -> update signal selection
   -> UpdateCandidate
   -> UpdateToCurationHandoff
   -> CurationDecision later

4. Update candidates may represent:
   verified claims, corrections, decisions, procedures, failed approaches, open questions, stale warnings, contradictions.

5. Unsupported or uncertain outputs do not become facts.
   They become review/open-question/needs-more-evidence candidates.

6. Markdown-first MVP:
   verified Markdown claim -> UpdateCandidate

7. Tool boundary:
   candidate.emit is allowed.
   memory.write and curation.decide are forbidden.

8. Next step:
   curation decides what becomes durable memory.
```

## Repository References

- `docs/architecture/update-baseline.md`
- `docs/architecture/verify-update-handoff.md`
- `docs/architecture/media-update-concept-proofs.md`
- `docs/architecture/update-readiness-review.md`
- `docs/architecture/feedback-update-relationships.md`
- `docs/agents/knowledge-update-agent.md`
- `docs/architecture/terminology.md`
