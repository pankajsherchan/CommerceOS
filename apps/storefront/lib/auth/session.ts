import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "commerceos_session";
export const AUTH_STATE_COOKIE_NAME = "commerceos_auth_state";

const DEVELOPMENT_SESSION_SECRET =
  "commerceos-development-session-secret-change-before-shipping";

export type AuthSession = {
  subject: string;
  issuer: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  idToken?: string;
  expiresAt: number;
};

export type AuthRequestState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
  returnTo: string;
  createdAt: number;
};

type CookiePayload<T> = {
  data: T;
  expiresAt: number;
};

const isProduction = process.env.NODE_ENV === "production";

export function getAuthSessionMaxAgeSeconds() {
  const rawValue = process.env.STOREFRONT_AUTH_SESSION_MAX_AGE_SECONDS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : 60 * 60 * 8;

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 60 * 60 * 8;
  }

  return parsedValue;
}

export function getAuthSessionSecret() {
  const secret = process.env.STOREFRONT_AUTH_SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (isProduction) {
    throw new Error(
      "STOREFRONT_AUTH_SESSION_SECRET must be set to at least 32 characters in production.",
    );
  }

  return DEVELOPMENT_SESSION_SECRET;
}

export function createRandomToken(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

export function safeReturnPath(value: string | null, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSession) {
    return null;
  }

  return readAuthSession(rawSession);
}

export function setAuthSessionCookie(response: NextResponse, session: AuthSession) {
  const maxAge = Math.max(0, session.expiresAt - Math.floor(Date.now() / 1000));

  response.cookies.set(SESSION_COOKIE_NAME, createSignedCookieValue(session, session.expiresAt), {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(AUTH_STATE_COOKIE_NAME);
}

export function setAuthStateCookie(response: NextResponse, state: AuthRequestState) {
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60;

  response.cookies.set(AUTH_STATE_COOKIE_NAME, createSignedCookieValue(state, expiresAt), {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
}

export async function readAuthRequestState() {
  const cookieStore = await cookies();
  const rawState = cookieStore.get(AUTH_STATE_COOKIE_NAME)?.value;

  if (!rawState) {
    return null;
  }

  return readSignedCookieValue(rawState, isAuthRequestState);
}

export function createSignedCookieValue<T>(data: T, expiresAt: number) {
  const payload = toBase64UrlJson({ data, expiresAt } satisfies CookiePayload<T>);
  const signature = signValue(payload);

  return `${payload}.${signature}`;
}

export function readAuthSession(rawValue: string) {
  return readSignedCookieValue(rawValue, isAuthSession);
}

export function readSignedCookieValue<T>(
  rawValue: string,
  isData: (value: unknown) => value is T,
) {
  const [payload, signature] = rawValue.split(".");

  if (!payload || !signature || !verifySignature(payload, signature)) {
    return null;
  }

  const parsedPayload = fromBase64UrlJson(payload);

  if (!isCookiePayload(parsedPayload) || !isData(parsedPayload.data)) {
    return null;
  }

  if (parsedPayload.expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsedPayload.data;
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSessionSecret()).update(value).digest("base64url");
}

function verifySignature(payload: string, signature: string) {
  const expectedSignature = Buffer.from(signValue(payload), "base64url");
  const actualSignature = Buffer.from(signature, "base64url");

  if (expectedSignature.byteLength !== actualSignature.byteLength) {
    return false;
  }

  return timingSafeEqual(expectedSignature, actualSignature);
}

function toBase64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function fromBase64UrlJson(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCookiePayload(value: unknown): value is CookiePayload<unknown> {
  return isRecord(value) && "data" in value && typeof value.expiresAt === "number";
}

function isAuthRequestState(value: unknown): value is AuthRequestState {
  return (
    isRecord(value) &&
    typeof value.state === "string" &&
    typeof value.nonce === "string" &&
    typeof value.codeVerifier === "string" &&
    typeof value.redirectUri === "string" &&
    typeof value.returnTo === "string" &&
    typeof value.createdAt === "number"
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  return (
    isRecord(value) &&
    typeof value.subject === "string" &&
    typeof value.issuer === "string" &&
    typeof value.expiresAt === "number" &&
    (value.email === undefined || typeof value.email === "string") &&
    (value.name === undefined || typeof value.name === "string") &&
    (value.preferredUsername === undefined ||
      typeof value.preferredUsername === "string") &&
    (value.idToken === undefined || typeof value.idToken === "string")
  );
}
