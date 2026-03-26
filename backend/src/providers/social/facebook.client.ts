import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { DiscoveredAccount, ExchangedToken, OAuthStartResult } from "./types";

type FacebookTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

type FacebookPage = {
  id: string;
  name: string;
  access_token: string;
  category?: string;
};

function assertFacebookConfigured() {
  if (!env.facebookAppId || !env.facebookAppSecret || !env.facebookRedirectUri) {
    throw new AppError("Facebook OAuth is not configured", 500);
  }
}

function mapExpiry(seconds?: number | null) {
  if (!seconds) {
    return null;
  }

  return new Date(Date.now() + seconds * 1000);
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch (_error) {
    return { raw: text };
  }
}

async function ensureOk(response: Response, defaultMessage: string) {
  if (response.ok) {
    return;
  }

  const payload = await readJsonResponse(response);
  const errorContainer =
    payload && typeof payload.error === "object" && payload.error !== null
      ? (payload.error as Record<string, unknown>)
      : null;
  const errorMessage =
    typeof errorContainer?.message === "string"
      ? errorContainer.message
      : typeof payload?.message === "string"
      ? payload.message
      : defaultMessage;

  throw new AppError(errorMessage, response.status);
}

export const facebookClient = {
  getAuthorizationUrl(state: string): OAuthStartResult {
    assertFacebookConfigured();

    const url = new URL(`https://www.facebook.com/${env.facebookGraphVersion}/dialog/oauth`);
    url.searchParams.set("client_id", env.facebookAppId);
    url.searchParams.set("redirect_uri", env.facebookRedirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", env.facebookScopes.join(","));

    return { authUrl: url.toString() };
  },
  async exchangeCode(code: string): Promise<ExchangedToken> {
    assertFacebookConfigured();

    const url = new URL(`https://graph.facebook.com/${env.facebookGraphVersion}/oauth/access_token`);
    url.searchParams.set("client_id", env.facebookAppId);
    url.searchParams.set("client_secret", env.facebookAppSecret);
    url.searchParams.set("redirect_uri", env.facebookRedirectUri);
    url.searchParams.set("code", code);

    const response = await fetch(url);
    await ensureOk(response, "Facebook token exchange failed");
    const payload = (await response.json()) as FacebookTokenResponse;

    return {
      accessToken: payload.access_token,
      accessTokenExpiresAt: mapExpiry(payload.expires_in),
      scopes: env.facebookScopes,
      metadata: {
        tokenType: payload.token_type ?? null
      }
    };
  },
  async exchangeLongLivedToken(accessToken: string): Promise<ExchangedToken> {
    assertFacebookConfigured();

    const url = new URL(`https://graph.facebook.com/${env.facebookGraphVersion}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", env.facebookAppId);
    url.searchParams.set("client_secret", env.facebookAppSecret);
    url.searchParams.set("fb_exchange_token", accessToken);

    const response = await fetch(url);
    await ensureOk(response, "Facebook long-lived token exchange failed");
    const payload = (await response.json()) as FacebookTokenResponse;

    return {
      accessToken: payload.access_token,
      accessTokenExpiresAt: mapExpiry(payload.expires_in),
      scopes: env.facebookScopes,
      metadata: {
        tokenType: payload.token_type ?? null
      }
    };
  },
  async listPages(userAccessToken: string) {
    const url = new URL(`https://graph.facebook.com/${env.facebookGraphVersion}/me/accounts`);
    url.searchParams.set("fields", "id,name,access_token,category");
    url.searchParams.set("access_token", userAccessToken);

    const response = await fetch(url);
    await ensureOk(response, "Facebook pages lookup failed");
    const payload = (await response.json()) as { data?: FacebookPage[] };
    return payload.data ?? [];
  },
  async discoverAccounts(token: ExchangedToken): Promise<DiscoveredAccount[]> {
    const longLivedToken = await this.exchangeLongLivedToken(token.accessToken).catch(() => token);
    const pages = await this.listPages(longLivedToken.accessToken);

    return pages.map((page) => ({
      platform: "FACEBOOK",
      accountType: "PAGE",
      accountId: page.id,
      accountName: page.name,
      accessToken: page.access_token,
      accessTokenExpiresAt: longLivedToken.accessTokenExpiresAt ?? null,
      scopes: longLivedToken.scopes,
      metadata: {
        category: page.category ?? null,
        userAccessToken: longLivedToken.accessToken
      }
    }));
  }
};
