import { PublicationPlatform, SocialAccountType } from "@prisma/client";

export type OAuthStartResult = {
  authUrl: string;
};

export type ExchangedToken = {
  accessToken: string;
  accessTokenExpiresAt?: Date | null;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: Date | null;
  scopes: string[];
  metadata?: Record<string, unknown>;
};

export type DiscoveredAccount = {
  platform: PublicationPlatform;
  accountType: SocialAccountType;
  accountId: string;
  accountUrn?: string | null;
  accountName: string;
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scopes: string[];
  metadata?: Record<string, unknown>;
};
