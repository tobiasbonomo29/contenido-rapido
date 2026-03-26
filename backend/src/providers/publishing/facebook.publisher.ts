import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { buildPublicationMessage } from "./helpers";
import { PublishResult, PublishableJob } from "./types";

async function readFacebookError(response: Response) {
  const text = await response.text();

  if (!text) {
    return "Facebook publication failed";
  }

  try {
    const payload = JSON.parse(text) as { error?: { message?: string } };
    return payload.error?.message || text;
  } catch (_error) {
    return text;
  }
}

export const facebookPublisher = {
  async publish(job: PublishableJob, shareableUrl?: string | null): Promise<PublishResult> {
    const message = buildPublicationMessage(job.content, shareableUrl);
    const url = new URL(`https://graph.facebook.com/${env.facebookGraphVersion}/${job.socialConnection.accountId}/feed`);
    const body = new URLSearchParams({
      message,
      access_token: job.socialConnection.accessToken
    });

    if (shareableUrl) {
      body.set("link", shareableUrl);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    if (!response.ok) {
      throw new AppError(await readFacebookError(response), response.status);
    }

    const payload = (await response.json()) as { id?: string };
    const externalPostId = payload.id || `${job.socialConnection.accountId}_${Date.now()}`;

    return {
      externalPostId,
      externalPostUrl: `https://www.facebook.com/${externalPostId}`,
      payloadSnapshot: {
        message,
        link: shareableUrl ?? null
      }
    };
  }
};
