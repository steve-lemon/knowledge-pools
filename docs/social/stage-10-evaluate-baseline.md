# Stage 10: Evaluate Architecture Baseline

This is the eleventh public-facing narrative for Knowledge Pools.

Use this document after the `evaluate` architecture has been clarified but before claiming that automated optimization, dashboards, or a working implementation are complete.

## Core Thesis

Evaluation is not self-modification.

For an agent-oriented knowledge repository, evaluation is the stage where completed runs become inspectable improvement evidence.

The system should learn from failures and decisions, but it should not silently change memory, prompts, retrieval policy, taxonomy, or curation outcomes.

The key question is:

```text
What should the system learn about its own process quality?
```

## What Changed

The project now has a clearer evaluate baseline:

- `evaluate` consumes `CurationToEvaluateHandoff`;
- `EvaluationSignal` and `EvaluationReport` are the primary outputs;
- clean runs are valid but must explain why no issue was found;
- missing traces or artifacts are quality signals;
- evaluation can recommend regression fixtures and follow-up work;
- Markdown-first evaluation is the first implementation target;
- evaluation tool access is reviewed through the evaluate readiness checklist;
- memory writes, curation decisions, update candidate emission, verification checks, retrieval, source reads, deletion, and projection mutation are forbidden.

The important boundary is:

```text
curation = decide durable memory
evaluate = record quality signals
future work = improve through explicit workflows
```

## Why This Matters

A knowledge system should not only answer.

It should notice when its own process failed.

Examples:

- retrieval missed expected evidence;
- reason produced unsupported claims;
- verify found stale or contradictory evidence;
- update proposed noisy candidates;
- curation rejected or deferred candidates;
- trace data was missing;
- a run should become a regression fixture.

Evaluation makes those signals visible.

But it does not fix them directly.

That distinction matters.

Without it, "learning system" becomes a polite name for uncontrolled self-modification.

## Design Moves

### 1. Evaluation Produces Signals And Reports

Evaluate emits:

- `EvaluationSignal`;
- `EvaluationReport`;
- retrieval miss summaries;
- verifier failure summaries;
- curation outcome summaries;
- trace completeness summaries;
- regression fixture recommendations.

It does not write durable memory.

### 2. Clean Runs Still Need Explanation

No signal can be a valid result.

But a clean report should still say why it is clean.

For example:

```text
all expected handoffs resolved
no unsupported claims
no schema failures
curation decisions had provenance
trace refs were complete
```

### 3. Evaluation Does Not Bypass The Loop

If evaluation finds a problem, it records a signal.

Corrections should re-enter the loop through:

```text
feedback -> update -> curation
```

Evaluation should not directly emit update candidates or modify durable records in v1.

### 4. Markdown-First Evaluation Comes First

The first implementation target is Markdown/text:

```text
CurationToEvaluateHandoff
-> trace/artifact review
-> EvaluationSignal[]
-> EvaluationReport
```

Initial metrics:

- retrieval miss count;
- unsupported claim count;
- verification failure count;
- update candidate count;
- accepted/rejected/deferred candidate count;
- schema failure count;
- trace completeness status.

### 5. Tool Permissions Matter

Required evaluation ports:

- `audit.read_trace`;
- `audit.trace`;
- `artifact.read`;
- `schema.validate`;
- `evaluation.record`;
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
- `curation.propose`;
- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.search`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.read`;
- source lifecycle and deletion tools.

## First Public Message

The eleventh share should not claim that the system now optimizes itself.

It should say:

> I finished the evaluate architecture baseline. The important lesson is that evaluation should record improvement evidence, not silently modify the system.

## Suggested Korean Summary

```text
Knowledge Pools의 evaluate 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

evaluate는 self-modification이 아닙니다.

curation이 durable memory 결정을 마치면,
evaluate는 그 run에서 어떤 품질 신호가 남았는지 기록합니다.

흐름은 이렇게 됩니다.

CurationToEvaluateHandoff
-> Evaluation Agent
-> EvaluationSignal[]
-> EvaluationReport

evaluate가 보는 것은 이런 것들입니다.

- retrieval miss
- unsupported claim
- stale evidence
- unresolved conflict
- schema failure
- tool failure
- curation rejected/deferred
- accepted memory
- missing trace
- regression candidate

중요한 점은
evaluate가 문제를 직접 고치지 않는다는 것입니다.

문제가 발견되면 signal과 recommendation을 남깁니다.
수정은 다시 feedback -> update -> curation 흐름을 타야 합니다.

즉 좋은 agent system은 스스로를 몰래 바꾸는 것이 아니라,
무엇이 잘됐고 무엇이 실패했는지를 추적 가능한 증거로 남긴 뒤,
명시적인 개선 루프로 연결해야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 evaluate 단계 설계를 정리했습니다.

이번 결론:

evaluate는 self-modification이 아닙니다.

evaluate는 완료된 run과 curation 결과를 읽고,
품질 신호를 기록하는 단계입니다.

출력은:

- EvaluationSignal
- EvaluationReport
- retrieval miss summary
- verifier failure summary
- curation outcome summary
- regression fixture recommendation

문제가 발견돼도 바로 memory를 고치지 않습니다.

signal과 recommendation을 남기고,
필요한 수정은 다시 feedback -> update -> curation 흐름으로 들어가야 합니다.

좋은 지식 시스템은 스스로를 몰래 바꾸는 것이 아니라,
실패와 결정을 추적 가능한 개선 증거로 남겨야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the evaluate architecture baseline for Knowledge Pools.

The main lesson:

evaluation is not self-modification.

Evaluate consumes curation outcomes and traces, then records quality signals:

CurationToEvaluateHandoff
-> Evaluation Agent
-> EvaluationSignal[]
-> EvaluationReport

It can record:

- retrieval misses
- unsupported claims
- stale evidence
- unresolved conflicts
- schema failures
- tool failures
- rejected or deferred candidates
- accepted memory
- missing traces
- regression candidates

But it should not silently fix anything.

No durable memory write.
No curation decision.
No update candidate emission.
No verification rerun.
No source or index mutation.

If evaluation finds a problem, it records a signal and recommendation.

Corrections should re-enter the explicit loop:

feedback -> update -> curation

A learning system should not secretly rewrite itself.
It should leave inspectable evidence for future improvement.
```

## Suggested Thread Outline

```text
1. I finished the evaluate architecture baseline for Knowledge Pools.

2. The key distinction:
   evaluation is not self-modification.
   It records improvement evidence.

3. The flow:
   CurationToEvaluateHandoff
   -> trace/artifact review
   -> EvaluationSignal[]
   -> EvaluationReport

4. Evaluation signals include retrieval misses, unsupported claims, stale evidence, schema failures, tool failures, and curation outcomes.

5. Clean runs are valid too.
   But a clean report should explain why it is clean.

6. Tool boundary:
   evaluation.record is allowed.
   memory.write, curation.decide, candidate.emit, verification.check, retrieval, and source/index mutation are forbidden.

7. If evaluation finds a problem, it records a signal.
   Corrections re-enter feedback -> update -> curation.

8. Next step:
   implement the Markdown-first vertical slice.
```

## Repository References

- `docs/architecture/evaluate-baseline.md`
- `docs/architecture/curation-evaluate-handoff.md`
- `docs/architecture/evaluate-readiness-review.md`
- `docs/agents/evaluation-agent.md`
- `docs/architecture/terminology.md`
- `docs/operations/implementation-plan.md`
