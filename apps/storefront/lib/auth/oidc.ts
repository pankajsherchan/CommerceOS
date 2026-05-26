import { createHash, createPublicKey, createVerify } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import {
  type AuthRequestState,
  type AuthSession,
  clearAuthCookies,
  createRandomToken,
  getAuthSessionMaxAgeSeconds,
  getCurrentSession,
  readAuthRequestState,
  safeReturnPath,
  setAuthSessionCookie,
  setAuthStateCookie,
} from "@/lib/auth/session";

const DEFAULT_KEYCLOAK_ISSUER = "http://localhost:8080/realms/commerceos";
const DEFAULT_STOREFRONT_CLIENT_ID = "commerceos-storefront";
const OIDC_SCOPE = "openid email profile";

type AuthStartMode = "sign-in" | "sign-up";

type OidcDiscovery = {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  endSessionEndpoint?: string;
};

type VerifiedIdToken = {
  subject: string;
  issuer: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  expiresAt: number;
};

type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signedContent: string;
  signature: Buffer;
};

export async function startAuthorization(request: NextRequest, mode: AuthStartMode) {
  const discovery = await getOidcDiscovery();
  const clientId = getStorefrontClientId();
  const requestUrl = new URL(request.url);
  const redirectUri = getRedirectUri(requestUrl);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("returnTo"));
  const authState = createAuthRequestState(redirectUri, returnTo);
  const authorizationEndpoint =
    mode === "sign-up"
      ? getKeycloakRegistrationEndpoint(discovery.authorizationEndpoint)
      : discovery.authorizationEndpoint;

  const authorizationUrl = new URL(authorizationEndpoint);
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", OIDC_SCOPE);
  authorizationUrl.searchParams.set("state", authState.state);
  authorizationUrl.searchParams.set("nonce", authState.nonce);
  authorizationUrl.searchParams.set("code_challenge", createCodeChallenge(authState.codeVerifier));
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  setAuthStateCookie(response, authState);

  return response;
}

export async function completeAuthorization(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return redirectWithAuthError(request, error);
  }

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const authState = await readAuthRequestState();

  if (!code || !state || !authState || authState.state !== state) {
    return redirectWithAuthError(request, "invalid_state");
  }

  const tokenResponse = await exchangeAuthorizationCode(code, authState);
  const verifiedIdToken = await verifyIdToken(tokenResponse.idToken, authState.nonce);
  const session = createSession(verifiedIdToken, tokenResponse.idToken);
  const response = NextResponse.redirect(new URL(authState.returnTo, request.url));

  clearAuthCookies(response);
  setAuthSessionCookie(response, session);

  return response;
}

export async function startSignOut(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("returnTo"), "/");
  const session = await getCurrentSession();
  const response = NextResponse.redirect(
    await getSignOutUrl(requestUrl, returnTo, session?.idToken),
  );

  clearAuthCookies(response);

  return response;
}

function createAuthRequestState(redirectUri: string, returnTo: string): AuthRequestState {
  return {
    codeVerifier: createRandomToken(64),
    createdAt: Math.floor(Date.now() / 1000),
    nonce: createRandomToken(),
    redirectUri,
    returnTo,
    state: createRandomToken(),
  };
}

function createCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

async function exchangeAuthorizationCode(code: string, authState: AuthRequestState) {
  const discovery = await getOidcDiscovery();
  const body = new URLSearchParams({
    client_id: getStorefrontClientId(),
    code,
    code_verifier: authState.codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: authState.redirectUri,
  });
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch(discovery.tokenEndpoint, {
    body,
    cache: "no-store",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Keycloak token exchange failed with status ${response.status}.`);
  }

  const payload = await response.json();

  if (!isRecord(payload) || typeof payload.id_token !== "string") {
    throw new Error("Keycloak token response did not include an ID token.");
  }

  return {
    idToken: payload.id_token,
  };
}

async function verifyIdToken(idToken: string, nonce: string): Promise<VerifiedIdToken> {
  const discovery = await getOidcDiscovery();
  const jwt = parseJwt(idToken);
  const algorithm = jwt.header.alg;
  const keyId = jwt.header.kid;

  if (algorithm !== "RS256" || typeof keyId !== "string") {
    throw new Error("Unsupported ID token header.");
  }

  const jwk = await getSigningJwk(discovery.jwksUri, keyId);

  if (!verifyJwtSignature(jwt, jwk)) {
    throw new Error("Invalid ID token signature.");
  }

  return validateIdTokenClaims(jwt.payload, discovery.issuer, getStorefrontClientId(), nonce);
}

function parseJwt(token: string): JwtParts {
  const [headerSegment, payloadSegment, signatureSegment] = token.split(".");

  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error("Invalid JWT format.");
  }

  const header = parseBase64UrlJson(headerSegment);
  const payload = parseBase64UrlJson(payloadSegment);

  if (!isRecord(header) || !isRecord(payload)) {
    throw new Error("Invalid JWT payload.");
  }

  return {
    header,
    payload,
    signature: Buffer.from(signatureSegment, "base64url"),
    signedContent: `${headerSegment}.${payloadSegment}`,
  };
}

function validateIdTokenClaims(
  claims: Record<string, unknown>,
  issuer: string,
  clientId: string,
  nonce: string,
): VerifiedIdToken {
  const audience = claims.aud;
  const now = Math.floor(Date.now() / 1000);

  if (claims.iss !== issuer) {
    throw new Error("ID token issuer did not match Keycloak issuer.");
  }

  if (
    !(
      audience === clientId ||
      (Array.isArray(audience) && audience.every((value) => typeof value === "string") &&
        audience.includes(clientId))
    )
  ) {
    throw new Error("ID token audience did not include the storefront client.");
  }

  if (claims.nonce !== nonce) {
    throw new Error("ID token nonce did not match the auth request.");
  }

  if (typeof claims.exp !== "number" || claims.exp <= now) {
    throw new Error("ID token is expired.");
  }

  if (typeof claims.sub !== "string") {
    throw new Error("ID token subject is missing.");
  }

  return {
    email: typeof claims.email === "string" ? claims.email : undefined,
    expiresAt: claims.exp,
    issuer,
    name: typeof claims.name === "string" ? claims.name : undefined,
    preferredUsername:
      typeof claims.preferred_username === "string" ? claims.preferred_username : undefined,
    subject: claims.sub,
  };
}

async function getSigningJwk(jwksUri: string, keyId: string) {
  const jwks = await fetchJsonObject(jwksUri);
  const keys = jwks.keys;

  if (!Array.isArray(keys)) {
    throw new Error("Keycloak JWKS response did not include keys.");
  }

  const jwk = keys.find(
    (value): value is Record<string, unknown> =>
      isRecord(value) && value.kid === keyId && value.kty === "RSA",
  );

  if (!jwk) {
    throw new Error("No matching Keycloak signing key was found.");
  }

  return jwk;
}

function verifyJwtSignature(jwt: JwtParts, jwk: Record<string, unknown>) {
  const publicKey = createPublicKey({
    format: "jwk",
    key: jwk,
  } as Parameters<typeof createPublicKey>[0]);
  const verifier = createVerify("RSA-SHA256");

  verifier.update(jwt.signedContent);
  verifier.end();

  return verifier.verify(publicKey, jwt.signature);
}

function createSession(verifiedIdToken: VerifiedIdToken, idToken: string): AuthSession {
  const now = Math.floor(Date.now() / 1000);

  return {
    email: verifiedIdToken.email,
    expiresAt: now + getAuthSessionMaxAgeSeconds(),
    idToken,
    issuer: verifiedIdToken.issuer,
    name: verifiedIdToken.name,
    preferredUsername: verifiedIdToken.preferredUsername,
    subject: verifiedIdToken.subject,
  };
}

async function getSignOutUrl(requestUrl: URL, returnTo: string, idToken?: string) {
  const discovery = await getOidcDiscovery();
  const postLogoutRedirectUri = new URL(returnTo, requestUrl.origin).toString();

  if (!discovery.endSessionEndpoint) {
    return postLogoutRedirectUri;
  }

  const logoutUrl = new URL(discovery.endSessionEndpoint);
  logoutUrl.searchParams.set("client_id", getStorefrontClientId());
  logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  if (idToken) {
    logoutUrl.searchParams.set("id_token_hint", idToken);
  }

  return logoutUrl;
}

async function getOidcDiscovery(): Promise<OidcDiscovery> {
  const issuer = getKeycloakIssuer();
  const discovery = await fetchJsonObject(
    `${issuer}/.well-known/openid-configuration`,
  );

  if (
    discovery.issuer !== issuer ||
    typeof discovery.authorization_endpoint !== "string" ||
    typeof discovery.token_endpoint !== "string" ||
    typeof discovery.jwks_uri !== "string"
  ) {
    throw new Error("Keycloak OIDC discovery response is missing required endpoints.");
  }

  return {
    authorizationEndpoint: discovery.authorization_endpoint,
    endSessionEndpoint:
      typeof discovery.end_session_endpoint === "string"
        ? discovery.end_session_endpoint
        : undefined,
    issuer: discovery.issuer,
    jwksUri: discovery.jwks_uri,
    tokenEndpoint: discovery.token_endpoint,
  };
}

async function fetchJsonObject(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} with status ${response.status}.`);
  }

  const payload = await response.json();

  if (!isRecord(payload)) {
    throw new Error(`Expected JSON object from ${url}.`);
  }

  return payload;
}

function getRedirectUri(requestUrl: URL) {
  return process.env.STOREFRONT_AUTH_REDIRECT_URI ?? `${requestUrl.origin}/auth/callback`;
}

function getKeycloakIssuer() {
  return process.env.KEYCLOAK_ISSUER_URL ?? DEFAULT_KEYCLOAK_ISSUER;
}

function getStorefrontClientId() {
  return process.env.KEYCLOAK_CLIENT_ID ?? DEFAULT_STOREFRONT_CLIENT_ID;
}

function getKeycloakRegistrationEndpoint(authorizationEndpoint: string) {
  return authorizationEndpoint.replace(/\/auth$/, "/registrations");
}

function redirectWithAuthError(request: NextRequest, error: string) {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("auth_error", error);

  return NextResponse.redirect(redirectUrl);
}

function parseBase64UrlJson(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
