import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret, sha256, randomToken } from "./crypto.js";

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a plaintext value", () => {
    const encrypted = encryptSecret("my-totp-secret");
    expect(encrypted).not.toContain("my-totp-secret");
    expect(decryptSecret(encrypted)).toBe("my-totp-secret");
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const a = encryptSecret("same-input");
    const b = encryptSecret("same-input");
    expect(a).not.toBe(b);
  });

  it("throws on a malformed payload", () => {
    expect(() => decryptSecret("not-a-valid-payload")).toThrow();
  });
});

describe("sha256", () => {
  it("is deterministic", () => {
    expect(sha256("hello")).toBe(sha256("hello"));
  });

  it("differs for different input", () => {
    expect(sha256("hello")).not.toBe(sha256("world"));
  });
});

describe("randomToken", () => {
  it("generates tokens of the expected approximate length and no two alike", () => {
    const a = randomToken();
    const b = randomToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });
});
