import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { DiscoveredAccount, ExchangedToken, OAuthStartResult } from "./types";

type LinkedInTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
};

type LinkedInUserInfo = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
};

type LinkedInOrganizationAcl = {
  organization?: string;
  role?: string;
  ["organization~"]?: {
    localizedName?: string;
  };
};

function assertLinkedInConfigured() {
  if (!env.linkedinClientId || !env.linkedinClientSecret || !env.linkedinRedirectUri) {
    throw new AppError("LinkedIn OAuth is not configured", 500);
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
  const errorMessage =
    typeof payload?.message === "string"
      ? payload.message
      : typeof payload?.error_description === "string"
      ? payload.error_description
      : typeof payload?.error === "string"
      ? payload.error
      : defaultMessage;

  throw new AppError(errorMessage, response.status);
}

export const linkedinClient = {
  getAuthorizationUrl(state: string): OAuthStartResult {
    assertLinkedInConfigured();

    const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", env.linkedinClientId);
    url.searchParams.set("redirect_uri", env.linkedinRedirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", env.linkedinScopes.join(" "));

    return { authUrl: url.toString() };
  },
  async exchangeCode(code: string): Promise<ExchangedToken> {
    assertLinkedInConfigured();

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.linkedinRedirectUri,
      client_id: env.linkedinClientId,
      client_secret: env.linkedinClientSecret
    });

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    await ensureOk(response, "LinkedIn token exchange failed");
    const payload = (await response.json()) as LinkedInTokenResponse;
    const scopes = payload.scope ? payload.scope.split(" ").filter(Boolean) : env.linkedinScopes;

    return {
      accessToken: payload.access_token,
      accessTokenExpiresAt: mapExpiry(payload.expires_in),
      refreshToken: payload.refresh_token ?? null,
      refreshTokenExpiresAt: mapExpiry(payload.refresh_token_expires_in),
      scopes
    };
  },
  async refreshAccessToken(refreshToken: string): Promise<ExchangedToken> {
    assertLinkedInConfigured();

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.linkedinClientId,
      client_secret: env.linkedinClientSecret
    });

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    await ensureOk(response, "LinkedIn token refresh failed");
    const payload = (await response.json()) as LinkedInTokenResponse;
    const scopes = payload.scope ? payload.scope.split(" ").filter(Boolean) : env.linkedinScopes;

    return {
      accessToken: payload.access_token,
      accessTokenExpiresAt: mapExpiry(payload.expires_in),
      refreshToken: payload.refresh_token ?? refreshToken,
      refreshTokenExpiresAt: mapExpiry(payload.refresh_token_expires_in),
      scopes
    };
  },
  async getUserInfo(accessToken: string) {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    await ensureOk(response, "LinkedIn user info lookup failed");
    return (await response.json()) as LinkedInUserInfo;
  },
  async listOrganizations(accessToken: string) {
    const url = new URL("https://api.linkedin.com/rest/organizationAcls");
    url.searchParams.set("q", "roleAssignee");
    url.searchParams.set("state", "APPROVED");
    url.searchParams.set("projection", "(elements*(organization,role,organization~(localizedName)))");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Linkedin-Version": env.linkedinApiVersion,
        "X-Restli-Protocol-Version": "2.0.0"
      }
    });

    await ensureOk(response, "LinkedIn organizations lookup failed");
    const payload = (await response.json()) as { elements?: LinkedInOrganizationAcl[] };
    return payload.elements ?? [];
  },
  async discoverAccounts(token: ExchangedToken): Promise<DiscoveredAccount[]> {
    const [userInfo, organizationAcls] = await Promise.all([
      this.getUserInfo(token.accessToken),
      this.listOrganizations(token.accessToken).catch(() => [])
    ]);

    if (!userInfo.sub) {
      throw new AppError("LinkedIn user identity could not be resolved", 400);
    }

    const memberName =
      userInfo.name ||
      [userInfo.given_name, userInfo.family_name].filter(Boolean).join(" ").trim() ||
      userInfo.email ||
      "LinkedIn Member";

    const accounts: DiscoveredAccount[] = [
      {
        platform: "LINKEDIN",
        accountType: "MEMBER",
        accountId: userInfo.sub,
        accountUrn: `urn:li:person:${userInfo.sub}`,
        accountName: memberName,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? null,
        accessTokenExpiresAt: token.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt ?? null,
        scopes: token.scopes,
        metadata: {
          email: userInfo.email ?? null
        }
      }
    ];

    const seenOrganizations = new Set<string>();

    for (const acl of organizationAcls) {
      const organizationUrn = acl.organization;
      if (!organizationUrn || seenOrganizations.has(organizationUrn)) {
        continue;
      }

      seenOrganizations.add(organizationUrn);
      const organizationId = organizationUrn.split(":").pop() || organizationUrn;
      const organizationName = acl["organization~"]?.localizedName || organizationId;

      accounts.push({
        platform: "LINKEDIN",
        accountType: "ORGANIZATION",
        accountId: organizationId,
        accountUrn: organizationUrn,
        accountName: organizationName,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? null,
        accessTokenExpiresAt: token.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt ?? null,
        scopes: token.scopes,
        metadata: {
          role: acl.role ?? null
        }
      });
    }

    return accounts;
  }
};
