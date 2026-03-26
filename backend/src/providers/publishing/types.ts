import { Content, PublicationJob, SocialConnection } from "@prisma/client";

export type PublishableJob = PublicationJob & {
  content: Content;
  socialConnection: SocialConnection;
};

export type PublishResult = {
  externalPostId: string;
  externalPostUrl?: string | null;
  payloadSnapshot: Record<string, unknown>;
};
