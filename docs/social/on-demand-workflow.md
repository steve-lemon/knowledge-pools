# On-Demand Social Content Workflow

Social content is prepared as a supporting layer, not as the main project workflow.

From this point forward, new social posts should be created only when explicitly requested.

## Operating Rule

Do not automatically generate new social content for every project step.

Instead:

1. Keep project documentation and implementation work primary.
2. Use `stage-plan.md` only as a map of possible sharing moments.
3. Generate stage-specific content only when requested.
4. Ground every generated post in the current repository state.
5. Save generated content only if the user asks to preserve it.

## Request Pattern

When a social content request arrives, identify:

- requested stage
- target channel
- language
- tone
- desired length
- repository changes or documents to reference

If those details are missing, make a reasonable default:

- stage: latest completed stage
- channel: general social post
- language: Korean, unless otherwise requested
- tone: clear and technical
- length: concise

## Content Generation Steps

1. Read the relevant stage in `stage-plan.md`.
2. Check the repository state and related docs.
3. Draft the post using `post-template.md`.
4. Verify that claims do not exceed actual progress.
5. Provide the content to the user.
6. Only write it to `drafts.md` or a new file when requested.

## Current Status

The social workspace is initialized and paused.

Existing Stage 0 drafts remain available as reference material. Future stage content should be produced on demand.

