# RAG Limitations

This document records the core limitations Knowledge Pools is intended to address.

## Chunk Myopia

Chunk retrieval often loses document-level structure. A retrieved passage may omit the surrounding assumptions, definitions, or exceptions that make it valid.

## Similarity Is Not Relevance

Embedding similarity can retrieve text that sounds related but does not answer the user's actual question.

## Weak Conflict Handling

Standard RAG often retrieves one plausible answer and ignores contradictory sources.

## Poor Temporal Reasoning

Older and newer knowledge can be mixed together unless the system explicitly tracks time, versions, and supersession.

## No Durable Decision Memory

Many systems remember facts but lose rationale. For long-running projects, the important knowledge is often why a choice was made.

## Limited Update Discipline

Without a knowledge update loop, conversations produce useful insight that disappears after the session.

## Design Response

Knowledge Pools responds with:

- claim-level memory
- source preservation
- hybrid retrieval
- graph relationships
- temporal metadata
- verifier agents
- decision records

