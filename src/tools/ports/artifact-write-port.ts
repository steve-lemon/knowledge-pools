import { ok } from "../../contracts/common.js";
import type { Artifact } from "../../runtime/agent-contracts.js";

export interface ArtifactWriteRequest<TPayload = unknown> {
  artifact: Artifact<TPayload>;
}

export interface ArtifactWriteResponse {
  artifactRef: string;
}

export function createInMemoryArtifactWritePort() {
  const artifacts = new Map<string, Artifact>();

  const handler = async (request: ArtifactWriteRequest) => {
    artifacts.set(request.artifact.meta.id, request.artifact);
    return ok({ artifactRef: `artifact:${request.artifact.meta.id}` });
  };

  return { handler, artifacts };
}
