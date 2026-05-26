import { createSignedCookieValue, readAuthSession, safeReturnPath } from "./session";

describe("auth session cookies", () => {
  it("round trips signed session payloads", () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    const signedValue = createSignedCookieValue(
      {
        expiresAt,
        issuer: "http://localhost:8080/realms/commerceos",
        subject: "user-123",
      },
      expiresAt,
    );

    expect(readAuthSession(signedValue)).toEqual({
      expiresAt,
      issuer: "http://localhost:8080/realms/commerceos",
      subject: "user-123",
    });
  });

  it("rejects tampered session payloads", () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 60;
    const signedValue = createSignedCookieValue(
      {
        expiresAt,
        issuer: "http://localhost:8080/realms/commerceos",
        subject: "user-123",
      },
      expiresAt,
    );

    expect(readAuthSession(`${signedValue}tampered`)).toBeNull();
  });
});

describe("safeReturnPath", () => {
  it("accepts local paths only", () => {
    expect(safeReturnPath("/checkout")).toBe("/checkout");
    expect(safeReturnPath("https://example.com")).toBe("/account");
    expect(safeReturnPath("//example.com")).toBe("/account");
  });
});
