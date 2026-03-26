import jwt from "jsonwebtoken";
import { Prisma, PublicationPlatform, SocialConnection } from "@prisma/client";
import { env } from "../config/env";
import { facebookClient, linkedinClient } from "../providers/social";
import { ExchangedToken } from "../providers/social/types";
import { socialConnectionRepo } from "../repositories/social-connection.repo";
import { AppError } from "../utils/errors";

type OAuthProvider = "linkedin" | "facebook";

type OAuthStatePayload = {
  userId: string;
  provider: OAuthProvider;
};

function serializeJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function buildCallbackRedirect(provider: OAuthProvider, status: "success" | "error", message?: string) {
  const url = new URL("/canales", env.frontendAppUrl);
  url.searchParams.set("provider", provider);
  url.searchParams.set("status", status);

  if (message) {
    url.searchParams.set("message", message);
  }

  return url.toString();
}

function signOAuthState(payload: OAuthStatePayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "15m" });
}

function verifyOAuthState(state: string) {
  return jwt.verify(state, env.jwtSecret) as OAuthStatePayload;
}

async function upsertAccountsForUser(userId: string, accounts: Awaited<ReturnType<typeof linkedinClient.discoverAccounts>>) {
  const savedConnections: SocialConnection[] = [];

  for (const account of accounts) {
    const connection = await socialConnectionRepo.upsertByUserPlatformAccount(userId, account.platform, account.accountId, {
      accountType: account.accountType,
      accountUrn: account.accountUrn ?? null,
      accountName: account.accountName,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken ?? null,
      accessTokenExpiresAt: account.accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt: account.refreshTokenExpiresAt ?? null,
      scopes: serializeJson(account.scopes),
      metadata: account.metadata ? serializeJson(account.metadata) : undefined,
      status: "ACTIVE",
      lastSyncedAt: new Date()
    });

    savedConnections.push(connection);
  }

  return savedConnections;
}

function isAccessTokenExpiringSoon(value?: Date | null) {
  if (!value) {
    return false;
  }

  return value.getTime() - Date.now() <= 5 * 60 * 1000;
}

export const socialConnectionService = {
  list(userId: string, platform?: PublicationPlatform) {
    return socialConnectionRepo.listByUser(userId, platform);
  },
  async disconnect(userId: string, id: string) {
    const connection = await socialConnectionRepo.getByIdForUser(id, userId);
    if (!connection) {
      throw new AppError("Social connection not found", 404);
    }

    return socialConnectionRepo.update(connection.id, {
      status: "DISCONNECTED"
    });
  },
  startOAuth(userId: string, provider: OAuthProvider) {
    const state = signOAuthState({ userId, provider });

    if (provider === "linkedin") {
      return linkedinClient.getAuthorizationUrl(state);
    }

    if (provider === "facebook") {
      return facebookClient.getAuthorizationUrl(state);
    }

    throw new AppError("Unsupported provider", 400);
  },
  async handleOAuthCallback(provider: OAuthProvider, query: { code?: string; state?: string; error?: string; error_description?: string }) {
    if (query.error) {
      return buildCallbackRedirect(provider, "error", query.error_description || query.error);
    }

    if (!query.code || !query.state) {
      return buildCallbackRedirect(provider, "error", "Missing OAuth code or state");
    }

    let statePayload: OAuthStatePayload;
    try {
      statePayload = verifyOAuthState(query.state);
    } catch (_error) {
      return buildCallbackRedirect(provider, "error", "OAuth state is invalid or expired");
    }

    if (statePayload.provider !== provider) {
      return buildCallbackRedirect(provider, "error", "OAuth provider mismatch");
    }

    try {
      let token: ExchangedToken;
      let savedConnections: SocialConnection[];

      if (provider === "linkedin") {
        token = await linkedinClient.exchangeCode(query.code);
        const accounts = await linkedinClient.discoverAccounts(token);
        savedConnections = await upsertAccountsForUser(statePayload.userId, accounts);
      } else {
        token = await facebookClient.exchangeCode(query.code);
        const accounts = await facebookClient.discoverAccounts(token);
        savedConnections = await upsertAccountsForUser(statePayload.userId, accounts);
      }

      if (savedConnections.length === 0) {
        return buildCallbackRedirect(provider, "error", "No publishable accounts were found for this channel");
      }

      return buildCallbackRedirect(provider, "success", `Connected ${savedConnections.length} account(s)`);
    } catch (error) {
      return buildCallbackRedirect(
        provider,
        "error",
        error instanceof Error ? error.message : "Social connection failed"
      );
    }
  },
  async resolveConnectionForScheduling(userId: string, platform: PublicationPlatform, socialConnectionId?: string) {
    if (socialConnectionId) {
      const connection = await socialConnectionRepo.getByIdForUser(socialConnectionId, userId);
      if (!connection || connection.platform !== platform) {
        throw new AppError("Selected social connection is invalid for this platform", 400);
      }

      if (connection.status !== "ACTIVE") {
        throw new AppError("Selected social connection is not active", 400);
      }

      return connection;
    }

    const defaultConnection = await socialConnectionRepo.getFirstActiveByUserAndPlatform(userId, platform);
    if (!defaultConnection) {
      throw new AppError(`Connect a ${platform === "LINKEDIN" ? "LinkedIn" : "Facebook"} account before scheduling`, 400);
    }

    return defaultConnection;
  },
  async prepareForPublishing(connection: SocialConnection) {
    if (connection.status !== "ACTIVE") {
      throw new AppError("Social connection is not active", 400);
    }

    if (connection.platform === "LINKEDIN" && connection.refreshToken && isAccessTokenExpiringSoon(connection.accessTokenExpiresAt)) {
      try {
        const refreshed = await linkedinClient.refreshAccessToken(connection.refreshToken);
        return socialConnectionRepo.update(connection.id, {
          accessToken: refreshed.accessToken,
          accessTokenExpiresAt: refreshed.accessTokenExpiresAt ?? null,
          refreshToken: refreshed.refreshToken ?? connection.refreshToken,
          refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt ?? connection.refreshTokenExpiresAt ?? null,
          scopes: serializeJson(refreshed.scopes),
          status: "ACTIVE",
          lastSyncedAt: new Date()
        });
      } catch (error) {
        await socialConnectionRepo.update(connection.id, {
          status: "EXPIRED"
        });

        throw new AppError(error instanceof Error ? error.message : "LinkedIn token refresh failed", 400);
      }
    }

    if (connection.accessTokenExpiresAt && connection.accessTokenExpiresAt <= new Date()) {
      await socialConnectionRepo.update(connection.id, {
        status: "EXPIRED"
      });
      throw new AppError("Social connection access token expired. Reconnect the channel.", 400);
    }

    return connection;
  }
};
