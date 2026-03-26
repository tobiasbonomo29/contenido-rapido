import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { buildPublicationMessage } from "./helpers";
import { PublishResult, PublishableJob } from "./types";

async function readLinkedInError(response: Response) {
  const text = await response.text();

  if (!text) {
    return "LinkedIn publication failed";
  }

  try {
    const payload = JSON.parse(text) as Record<string, unknown>;
    if (typeof payload.message === "string") {
      return payload.message;
    }

    return text;
  } catch (_error) {
    return text;
  }
}

export const linkedinPublisher = {
  async publish(job: PublishableJob, shareableUrl?: string | null): Promise<PublishResult> {
    const authorUrn = job.socialConnection.accountUrn || `urn:li:person:${job.socialConnection.accountId}`;
    const commentary = buildPublicationMessage(job.content, shareableUrl);

    const payload = {
      author: authorUrn,
      commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${job.socialConnection.accessToken}`,
        "Content-Type": "application/json",
        "Linkedin-Version": env.linkedinApiVersion,
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new AppError(await readLinkedInError(response), response.status);
    }

    const externalPostId =
      response.headers.get("x-restli-id") ||
      response.headers.get("x-linkedin-id") ||
      `${authorUrn}:${Date.now()}`;

    return {
      externalPostId,
      externalPostUrl: null,
      payloadSnapshot: payload
    };
  }
};
