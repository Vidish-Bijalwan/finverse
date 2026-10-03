import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { Mt as Delete } from "../_libs/lucide-react.mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { t as KeyButton } from "./KeyButton-CZ7zbIKy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applock-hooks-BqaUs1r-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LENGTH = 6;
function formatCooldown(totalSeconds) {
	const s = Math.max(0, Math.ceil(totalSeconds));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}
/**
* 6-dot PIN entry. Hollow dots fill as digits are typed; the PIN digits are
* NEVER rendered. On 6 digits, onComplete(pin) fires and the buffer clears.
* Error state: shake animation + message (role="alert"). Disabled state:
* keypad locked with a live cooldown countdown.
*/
function PinPad({ onComplete, error, disabled = false, cooldownSeconds = 0, title = "Enter PIN", className }) {
	const [pin, setPin] = (0, import_react.useState)("");
	const [shaking, setShaking] = (0, import_react.useState)(false);
	const [remaining, setRemaining] = (0, import_react.useState)(cooldownSeconds);
	const reduced = usePrefersReducedMotion();
	const completedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		setRemaining(cooldownSeconds);
		if (cooldownSeconds <= 0) return;
		const id = window.setInterval(() => {
			setRemaining((r) => {
				if (r <= 1) {
					window.clearInterval(id);
					return 0;
				}
				return r - 1;
			});
		}, 1e3);
		return () => window.clearInterval(id);
	}, [cooldownSeconds, disabled]);
	(0, import_react.useEffect)(() => {
		if (!error) return;
		setPin("");
		completedRef.current = false;
		if (reduced) return;
		setShaking(true);
		const id = window.setTimeout(() => setShaking(false), 500);
		return () => window.clearTimeout(id);
	}, [error, reduced]);
	const press = (d) => {
		if (disabled || completedRef.current || pin.length >= LENGTH) return;
		const next = pin + d;
		if (next.length === LENGTH) {
			completedRef.current = true;
			onComplete(next);
			setPin("");
		} else setPin(next);
	};
	const backspace = () => {
		if (disabled || completedRef.current) return;
		setPin((p) => p.slice(0, -1));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center gap-6", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes fv-pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .fv-pin-shake { animation: fv-pin-shake 0.45s ease; }
        @media (prefers-reduced-motion: reduce) {
          .fv-pin-shake { animation: none; }
        }
      ` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex items-center gap-3", shaking && "fv-pin-shake"),
				role: "group",
				"aria-label": `PIN entry, ${pin.length} of ${LENGTH} digits entered`,
				children: Array.from({ length: LENGTH }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: cn("grid size-4 place-items-center rounded-full border-2", error ? "border-danger" : i < pin.length ? "border-primary bg-primary" : "border-muted-foreground/40")
				}, i))
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm font-semibold text-danger",
				children: error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "h-5 text-sm text-muted-foreground",
				"aria-hidden": true,
				children: disabled && remaining > 0 ? `Try again in ${formatCooldown(remaining)}` : ""
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid w-full max-w-64 grid-cols-3 gap-2",
				role: "group",
				"aria-label": "PIN keypad",
				children: [
					[
						"1",
						"2",
						"3",
						"4",
						"5",
						"6",
						"7",
						"8",
						"9"
					].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinKey, {
						label: d,
						disabled,
						onPress: () => press(d)
					}, d)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": true }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinKey, {
						label: "0",
						disabled,
						onPress: () => press("0")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyButton, {
						label: "Delete last digit",
						disabled: disabled || pin.length === 0,
						onPress: backspace,
						className: "grid h-14 place-items-center rounded-2xl bg-keypad text-keypad-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, {
							className: "size-6",
							"aria-hidden": true
						})
					})
				]
			})
		]
	});
}
function PinKey({ label, disabled, onPress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyButton, {
		label,
		disabled,
		onPress,
		className: "h-14 rounded-2xl bg-keypad text-xl font-semibold text-keypad-foreground tabular-nums",
		children: label
	});
}
/** Lock is "enabled" when the user has a PIN set (pin_hash present). */
function isLockEnabled(row) {
	return !!row && typeof row.pin_hash === "string" && row.pin_hash.length > 0;
}
/** PBKDF2 iterations for PIN derivation. */
var PBKDF2_ITERATIONS = 1e5;
/** Supported auto-lock timeouts (seconds) — matches the DB check constraint. */
var APP_LOCK_TIMEOUTS = [
	{
		value: 30,
		label: "30 seconds"
	},
	{
		value: 60,
		label: "1 minute"
	},
	{
		value: 120,
		label: "2 minutes"
	},
	{
		value: 300,
		label: "5 minutes"
	},
	{
		value: 600,
		label: "10 minutes"
	}
];
function subtle() {
	const sc = globalThis.crypto?.subtle;
	if (!sc) throw new Error("App lock needs WebCrypto (crypto.subtle), which is unavailable in this context — use HTTPS or localhost. The PIN was never stored or sent.");
	return sc;
}
/** 16 random bytes, returned as a 32-char lowercase hex string. */
function generateSalt() {
	const bytes = /* @__PURE__ */ new Uint8Array(16);
	globalThis.crypto.getRandomValues(bytes);
	return bytesToHex(bytes);
}
/**
* Derive a hex digest from `pin` + hex `salt` via PBKDF2-SHA256, 100k
* iterations. Validates the PIN is exactly 6 ASCII digits (the PIN pad's
* contract) so malformed input fails loudly instead of hashing silently.
*/
async function hashPin(pin, salt) {
	assertPinFormat(pin);
	assertSaltFormat(salt);
	const crypto_ = subtle();
	const key = await crypto_.importKey("raw", new TextEncoder().encode(pin), { name: "PBKDF2" }, false, ["deriveBits"]);
	const bits = await crypto_.deriveBits({
		name: "PBKDF2",
		salt: hexToBytes(salt),
		iterations: PBKDF2_ITERATIONS,
		hash: "SHA-256"
	}, key, 256);
	return bytesToHex(new Uint8Array(bits));
}
/**
* Constant-time comparison of a candidate PIN against a stored salt+hash.
* Returns false (not throws) for malformed input so callers can treat any
* mismatch as a plain wrong-PIN attempt.
*
* Note: this is XOR-loop comparison on hex strings — it removes the
* early-exit timing channel present in `===`. It is not a hardware-level
* guarantee, but it is the correct practice for a client-side unlock gate.
*/
async function verifyPin(pin, salt, hash) {
	let candidate;
	try {
		candidate = await hashPin(pin, salt);
	} catch {
		return false;
	}
	return timingSafeEqualHex(candidate, hash);
}
/** Constant-time equality over lowercase hex digests. */
function timingSafeEqualHex(a, b) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}
/** PIN contract: exactly 6 ASCII digits. */
function isValidPin(pin) {
	return /^[0-9]{6}$/.test(pin);
}
function assertPinFormat(pin) {
	if (!isValidPin(pin)) throw new Error("PIN must be exactly 6 digits.");
}
function assertSaltFormat(salt) {
	if (!/^[0-9a-f]{32}$/i.test(salt)) throw new Error("Invalid salt format.");
}
function bytesToHex(bytes) {
	let out = "";
	for (const b of bytes) out += b.toString(16).padStart(2, "0");
	return out;
}
function hexToBytes(hex) {
	const bytes = new Uint8Array(/* @__PURE__ */ new ArrayBuffer(hex.length / 2));
	for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	return bytes;
}
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
function credKey(userId) {
	return `finverse:webauthn-cred:${userId}`;
}
/**
* True only when the browser exposes a user-verifying *platform*
* authenticator (built-in biometrics). Never feature-detects on user-agent.
*/
async function platformBiometricAvailable() {
	try {
		const PKC = window.PublicKeyCredential;
		if (!PKC || typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== "function") return false;
		return await PKC.isUserVerifyingPlatformAuthenticatorAvailable();
	} catch {
		return false;
	}
}
function b64urlEncode(bytes) {
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function b64urlDecode(s) {
	const b64 = s.replaceAll("-", "+").replaceAll("_", "/");
	const bin = atob(b64 + "=".repeat((4 - b64.length % 4) % 4));
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes.buffer;
}
/**
* Enroll this device's platform authenticator. Prompts the OS biometric
* dialog via `navigator.credentials.create`. Returns the credential id on
* success; throws on cancellation / failure / unsupported platform.
*/
async function registerBiometric(userId, userLabel) {
	if (typeof navigator === "undefined" || !navigator.credentials?.create) throw new Error("This device or browser doesn't support biometric setup.");
	const challenge = /* @__PURE__ */ new Uint8Array(32);
	globalThis.crypto.getRandomValues(challenge);
	const cred = await navigator.credentials.create({ publicKey: {
		challenge,
		rp: {
			name: "FinVerse",
			id: window.location.hostname
		},
		user: {
			id: new TextEncoder().encode(userId),
			name: userLabel,
			displayName: userLabel
		},
		pubKeyCredParams: [{
			type: "public-key",
			alg: -7
		}, {
			type: "public-key",
			alg: -257
		}],
		authenticatorSelection: {
			authenticatorAttachment: "platform",
			userVerification: "required",
			residentKey: "preferred"
		},
		timeout: 6e4,
		attestation: "none"
	} });
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
async function assertBiometric(userId) {
	if (typeof navigator === "undefined" || !navigator.credentials?.get) throw new Error("This device or browser doesn't support biometric unlock.");
	const challenge = /* @__PURE__ */ new Uint8Array(32);
	globalThis.crypto.getRandomValues(challenge);
	const stored = window.localStorage.getItem(credKey(userId));
	const requestOptions = {
		challenge,
		rpId: window.location.hostname,
		userVerification: "required",
		timeout: 6e4
	};
	if (stored) requestOptions.allowCredentials = [{
		type: "public-key",
		id: b64urlDecode(stored)
	}];
	if (!await navigator.credentials.get({ publicKey: requestOptions })) throw new Error("Biometric verification didn't complete.");
}
/** Forget this device's enrolled credential (called when lock is disabled). */
function clearBiometricCredential(userId) {
	try {
		window.localStorage.removeItem(credKey(userId));
	} catch {}
}
/**
* React Query hooks over the `app_lock` table (0002_revamp.sql).
*
* Query keys are namespaced as ['finverse', 'app-lock']. Every mutation is
* scoped `.eq("user_id", uid)` and invalidates the lock key on success.
*
* Graceful degradation: if the migration hasn't been applied, PostgREST
* returns 42P01 (relation does not exist) and `useAppLock()` reports
* `tableMissing: true` instead of throwing — callers render an honest
* "setup pending" notice. Mutations in that state surface a clear error.
*/
var QK = { appLock: ["finverse", "app-lock"] };
/** PostgREST code for "relation does not exist" (migration not applied). */
function isMissingTable(error) {
	return typeof error === "object" && error !== null && error.code === "42P01";
}
function tableMissingError() {
	return /* @__PURE__ */ new Error("App lock is unavailable: the app_lock table doesn't exist yet. Run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.");
}
/** Current user id; throws a clear error when there is no signed-in user. */
async function currentUid() {
	const { data } = await getSupabase().auth.getUser();
	const id = data.user?.id;
	if (!id) throw new Error("Not signed in — sign in before changing app-lock settings.");
	return id;
}
/** Fetch the lock row; reports tableMissing instead of throwing on 42P01. */
function useAppLock() {
	const { user } = useAuth();
	return useQuery({
		queryKey: QK.appLock,
		enabled: !!user,
		retry: (count, err) => !isMissingTable(err) && count < 2,
		queryFn: async () => {
			const uid = await currentUid();
			const { data, error } = await getSupabase().from("app_lock").select("*").eq("user_id", uid).maybeSingle();
			if (error) {
				if (isMissingTable(error)) return {
					row: null,
					tableMissing: true
				};
				throw new Error(error.message || "Couldn't load app-lock settings.");
			}
			return {
				row: data ?? null,
				tableMissing: false
			};
		}
	});
}
function useInvalidateLock() {
	const qc = useQueryClient();
	return () => {
		qc.invalidateQueries({ queryKey: QK.appLock });
	};
}
/** Set a fresh PIN (first-time setup). Salts + hashes client-side; upserts. */
function useSetPin() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async (pin) => {
			const uid = await currentUid();
			const salt = generateSalt();
			const hash = await hashPin(pin, salt);
			const { data, error } = await getSupabase().from("app_lock").upsert({
				user_id: uid,
				pin_salt: salt,
				pin_hash: hash,
				failed_attempts: 0,
				locked_until: null
			}, { onConflict: "user_id" }).select("*").eq("user_id", uid).single();
			if (error) {
				if (isMissingTable(error)) throw tableMissingError();
				throw new Error(error.message || "Couldn't save your passcode.");
			}
			return data;
		},
		onSuccess: invalidate
	});
}
/** Change the PIN: verifies the current PIN, then upserts salt+hash of the new one. */
function useChangePin() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async ({ currentPin, newPin }) => {
			const uid = await currentUid();
			const { data: existing, error: readError } = await getSupabase().from("app_lock").select("*").eq("user_id", uid).maybeSingle();
			if (readError) {
				if (isMissingTable(readError)) throw tableMissingError();
				throw new Error(readError.message || "Couldn't load app-lock settings.");
			}
			const row = existing ?? null;
			if (!isLockEnabled(row)) throw new Error("No passcode is set — set one first.");
			if (!await verifyPin(currentPin, row.pin_salt, row.pin_hash)) throw new Error("Current passcode is incorrect.");
			const salt = generateSalt();
			const hash = await hashPin(newPin, salt);
			const { data, error } = await getSupabase().from("app_lock").update({
				pin_salt: salt,
				pin_hash: hash,
				failed_attempts: 0,
				locked_until: null
			}).eq("user_id", uid).select("*").single();
			if (error) throw new Error(error.message || "Couldn't change your passcode.");
			return data;
		},
		onSuccess: invalidate
	});
}
/** Disable the lock entirely (deletes the row + forgets the device credential). */
function useDisableLock() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async () => {
			const uid = await currentUid();
			const { error } = await getSupabase().from("app_lock").delete().eq("user_id", uid);
			if (error) {
				if (isMissingTable(error)) throw tableMissingError();
				throw new Error(error.message || "Couldn't disable app lock.");
			}
			clearBiometricCredential(uid);
		},
		onSuccess: invalidate
	});
}
/** Update timeout and/or the biometric flag. */
function useUpdateLockSettings() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async (patch) => {
			const uid = await currentUid();
			const { data, error } = await getSupabase().from("app_lock").update(patch).eq("user_id", uid).select("*").single();
			if (error) {
				if (isMissingTable(error)) throw tableMissingError();
				throw new Error(error.message || "Couldn't update app-lock settings.");
			}
			return data;
		},
		onSuccess: invalidate
	});
}
/**
* Record a wrong PIN: increments failed_attempts; on the 5th consecutive
* failure sets locked_until = now + 30s. Returns the new count.
*/
function useRecordFailedAttempt() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async () => {
			const uid = await currentUid();
			const { data: existing, error: readError } = await getSupabase().from("app_lock").select("failed_attempts").eq("user_id", uid).maybeSingle();
			if (readError) {
				if (isMissingTable(readError)) throw tableMissingError();
				throw new Error(readError.message || "Couldn't record the attempt.");
			}
			const attempts = (existing?.failed_attempts ?? 0) + 1;
			const lockedOut = attempts >= 5;
			const patch = { failed_attempts: attempts };
			if (lockedOut) patch.locked_until = new Date(Date.now() + 3e4).toISOString();
			const { error } = await getSupabase().from("app_lock").update(patch).eq("user_id", uid);
			if (error) throw new Error(error.message || "Couldn't record the attempt.");
			return {
				failed_attempts: attempts,
				lockedOut
			};
		},
		onSuccess: invalidate
	});
}
/** Clear failed_attempts / locked_until after a successful unlock. */
function useResetAttempts() {
	const invalidate = useInvalidateLock();
	return useMutation({
		mutationFn: async () => {
			const uid = await currentUid();
			const { error } = await getSupabase().from("app_lock").update({
				failed_attempts: 0,
				locked_until: null
			}).eq("user_id", uid);
			if (error) {
				if (isMissingTable(error)) throw tableMissingError();
				throw new Error(error.message || "Couldn't reset lockout attempts.");
			}
		},
		onSuccess: invalidate
	});
}
//#endregion
export { isLockEnabled as a, useAppLock as c, useRecordFailedAttempt as d, useResetAttempts as f, verifyPin as h, clearBiometricCredential as i, useChangePin as l, useUpdateLockSettings as m, PinPad as n, platformBiometricAvailable as o, useSetPin as p, assertBiometric as r, registerBiometric as s, APP_LOCK_TIMEOUTS as t, useDisableLock as u };
