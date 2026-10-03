/**
 * Honest WebAuthn (platform biometrics) for the app lock.
 *
 * Scope note — this is a *device-local convenience unlock*, not a
 * server-verified authentication. There is no backend verifier in this
 * architecture (the app talks to Supabase directly from the browser), so
 * the ceremonies below genuinely run against the platform authenticator
 * (Face ID / Touch ID / Windows Hello / Android biometrics) on THIS device
 * and gate the local unlock UI. The PIN remains the authoritative
 * credential: it is still required for first-time setup, recovery goes
 * through Supabase re-authentication, and biometrics never bypass
 * server-side security (there is none client-side to bypass — RLS still
 * enforces every Supabase row via the session).
 *
 * - If the platform has no user-verifying authenticator,
 *   `platformBiometricAvailable()` returns false and the UI must not offer
 *   the option (no fake fingerprint button).
 * - If the ceremony fails (user cancels, no credential enrolled, hardware
 *   error), the caller must fall back to PIN with a clear message.
 * - The credential ID is a public identifier, safe to keep in localStorage
 *   keyed per user; it is never a secret.
 */

/** localStorage key for the enrolled WebAuthn credential id (per user). */
function credKey(userId: string): string {
  return `finverse:webauthn-cred:${userId}`;
}

/**
 * True only when the browser exposes a user-verifying *platform*
 * authenticator (built-in biometrics). Never feature-detects on user-agent.
 */
export async function platformBiometricAvailable(): Promise<boolean> {
  try {
    const PKC = (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential as
      | {
          isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
        }
      | undefined;
    if (!PKC || typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
      return false;
    }
    return await PKC.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): ArrayBuffer {
  const b64 = s.replaceAll("-", "+").replaceAll("_", "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

/**
 * Enroll this device's platform authenticator. Prompts the OS biometric
 * dialog via `navigator.credentials.create`. Returns the credential id on
 * success; throws on cancellation / failure / unsupported platform.
 */
export async function registerBiometric(userId: string, userLabel: string): Promise<string> {
  if (typeof navigator === "undefined" || !navigator.credentials?.create) {
    throw new Error("This device or browser doesn't support biometric setup.");
  }
  const challenge = new Uint8Array(32);
  globalThis.crypto.getRandomValues(challenge);
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "FinVerse", id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId),
        name: userLabel,
        displayName: userLabel,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("Biometric setup didn't complete — no credential was created.");
  const id = b64urlEncode(new Uint8Array(cred.rawId));
  window.localStorage.setItem(credKey(userId), id);
  return id;
}

/**
 * Challenge the platform authenticator for an unlock. Prompts the OS
 * biometric dialog via `navigator.credentials.get`. Resolves (no return
 * value — the ceremony's success IS the signal) when the user verifies;
 * throws when they cancel or the authenticator errors.
 */
export async function assertBiometric(userId: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.credentials?.get) {
    throw new Error("This device or browser doesn't support biometric unlock.");
  }
  const challenge = new Uint8Array(32);
  globalThis.crypto.getRandomValues(challenge);
  const stored = window.localStorage.getItem(credKey(userId));
  const requestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    userVerification: "required",
    timeout: 60_000,
  };
  if (stored) {
    requestOptions.allowCredentials = [{ type: "public-key", id: b64urlDecode(stored) }];
  }
  const assertion = await navigator.credentials.get({ publicKey: requestOptions });
  if (!assertion) {
    throw new Error("Biometric verification didn't complete.");
  }
}

/** Forget this device's enrolled credential (called when lock is disabled). */
export function clearBiometricCredential(userId: string): void {
  try {
    window.localStorage.removeItem(credKey(userId));
  } catch {
    // localStorage may be unavailable (private mode) — nothing to forget.
  }
}
