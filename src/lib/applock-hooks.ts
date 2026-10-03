import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabase } from "./supabase";
import { useAuth } from "./auth";
import {
  LOCKOUT_SECONDS,
  MAX_FAILED_ATTEMPTS,
  generateSalt,
  hashPin,
  isLockEnabled,
  verifyPin,
  type AppLockRow,
} from "./applock";
import { clearBiometricCredential } from "./applock-webauthn";

export type { AppLockRow };

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

const QK = { appLock: ["finverse", "app-lock"] as const };

/** PostgREST code for "relation does not exist" (migration not applied). */
function isMissingTable(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: string }).code === "42P01"
  );
}

function tableMissingError(): Error {
  return new Error(
    "App lock is unavailable: the app_lock table doesn't exist yet. Run supabase/migrations/0002_revamp.sql in the Supabase SQL editor.",
  );
}

/** Current user id; throws a clear error when there is no signed-in user. */
async function currentUid(): Promise<string> {
  const { data } = await getSupabase().auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in — sign in before changing app-lock settings.");
  return id;
}

export interface AppLockState {
  /** The user's row, or null when no PIN has been set. */
  row: AppLockRow | null;
  /** True when the `app_lock` table is missing (migration not run). */
  tableMissing: boolean;
}

/** Fetch the lock row; reports tableMissing instead of throwing on 42P01. */
export function useAppLock() {
  const { user } = useAuth();
  return useQuery<AppLockState, Error>({
    queryKey: QK.appLock,
    enabled: !!user,
    retry: (count, err) => !isMissingTable(err) && count < 2,
    queryFn: async (): Promise<AppLockState> => {
      const uid = await currentUid();
      const { data, error } = await getSupabase()
        .from("app_lock")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) {
        if (isMissingTable(error)) return { row: null, tableMissing: true };
        throw new Error(error.message || "Couldn't load app-lock settings.");
      }
      return { row: (data as AppLockRow | null) ?? null, tableMissing: false };
    },
  });
}

function useInvalidateLock() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: QK.appLock });
  };
}

/** Set a fresh PIN (first-time setup). Salts + hashes client-side; upserts. */
export function useSetPin() {
  const invalidate = useInvalidateLock();
  return useMutation<AppLockRow, Error, string>({
    mutationFn: async (pin) => {
      const uid = await currentUid();
      const salt = generateSalt();
      const hash = await hashPin(pin, salt); // throws on bad PIN format
      const { data, error } = await getSupabase()
        .from("app_lock")
        .upsert(
          {
            user_id: uid,
            pin_salt: salt,
            pin_hash: hash,
            failed_attempts: 0,
            locked_until: null,
          },
          { onConflict: "user_id" },
        )
        .select("*")
        .eq("user_id", uid)
        .single();
      if (error) {
        if (isMissingTable(error)) throw tableMissingError();
        throw new Error(error.message || "Couldn't save your passcode.");
      }
      return data as AppLockRow;
    },
    onSuccess: invalidate,
  });
}

/** Change the PIN: verifies the current PIN, then upserts salt+hash of the new one. */
export function useChangePin() {
  const invalidate = useInvalidateLock();
  return useMutation<AppLockRow, Error, { currentPin: string; newPin: string }>({
    mutationFn: async ({ currentPin, newPin }) => {
      const uid = await currentUid();
      const { data: existing, error: readError } = await getSupabase()
        .from("app_lock")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (readError) {
        if (isMissingTable(readError)) throw tableMissingError();
        throw new Error(readError.message || "Couldn't load app-lock settings.");
      }
      const row = (existing as AppLockRow | null) ?? null;
      if (!isLockEnabled(row)) {
        throw new Error("No passcode is set — set one first.");
      }
      const ok = await verifyPin(currentPin, row!.pin_salt, row!.pin_hash);
      if (!ok) throw new Error("Current passcode is incorrect.");
      const salt = generateSalt();
      const hash = await hashPin(newPin, salt);
      const { data, error } = await getSupabase()
        .from("app_lock")
        .update({ pin_salt: salt, pin_hash: hash, failed_attempts: 0, locked_until: null })
        .eq("user_id", uid)
        .select("*")
        .single();
      if (error) throw new Error(error.message || "Couldn't change your passcode.");
      return data as AppLockRow;
    },
    onSuccess: invalidate,
  });
}

/** Disable the lock entirely (deletes the row + forgets the device credential). */
export function useDisableLock() {
  const invalidate = useInvalidateLock();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const uid = await currentUid();
      const { error } = await getSupabase().from("app_lock").delete().eq("user_id", uid);
      if (error) {
        if (isMissingTable(error)) throw tableMissingError();
        throw new Error(error.message || "Couldn't disable app lock.");
      }
      clearBiometricCredential(uid);
    },
    onSuccess: invalidate,
  });
}

/** Update timeout and/or the biometric flag. */
export function useUpdateLockSettings() {
  const invalidate = useInvalidateLock();
  return useMutation<
    AppLockRow,
    Error,
    { timeout_secs?: AppLockRow["timeout_secs"]; biometric_enabled?: boolean }
  >({
    mutationFn: async (patch) => {
      const uid = await currentUid();
      const { data, error } = await getSupabase()
        .from("app_lock")
        .update(patch)
        .eq("user_id", uid)
        .select("*")
        .single();
      if (error) {
        if (isMissingTable(error)) throw tableMissingError();
        throw new Error(error.message || "Couldn't update app-lock settings.");
      }
      return data as AppLockRow;
    },
    onSuccess: invalidate,
  });
}

export interface FailedAttemptResult {
  failed_attempts: number;
  /** True when this attempt triggered the cooldown lockout. */
  lockedOut: boolean;
}

/**
 * Record a wrong PIN: increments failed_attempts; on the 5th consecutive
 * failure sets locked_until = now + 30s. Returns the new count.
 */
export function useRecordFailedAttempt() {
  const invalidate = useInvalidateLock();
  return useMutation<FailedAttemptResult, Error, void>({
    mutationFn: async () => {
      const uid = await currentUid();
      const { data: existing, error: readError } = await getSupabase()
        .from("app_lock")
        .select("failed_attempts")
        .eq("user_id", uid)
        .maybeSingle();
      if (readError) {
        if (isMissingTable(readError)) throw tableMissingError();
        throw new Error(readError.message || "Couldn't record the attempt.");
      }
      const attempts = ((existing as { failed_attempts: number } | null)?.failed_attempts ?? 0) + 1;
      const lockedOut = attempts >= MAX_FAILED_ATTEMPTS;
      const patch: { failed_attempts: number; locked_until?: string | null } = {
        failed_attempts: attempts,
      };
      if (lockedOut) {
        patch.locked_until = new Date(Date.now() + LOCKOUT_SECONDS * 1000).toISOString();
      }
      const { error } = await getSupabase().from("app_lock").update(patch).eq("user_id", uid);
      if (error) throw new Error(error.message || "Couldn't record the attempt.");
      return { failed_attempts: attempts, lockedOut };
    },
    onSuccess: invalidate,
  });
}

/** Clear failed_attempts / locked_until after a successful unlock. */
export function useResetAttempts() {
  const invalidate = useInvalidateLock();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const uid = await currentUid();
      const { error } = await getSupabase()
        .from("app_lock")
        .update({ failed_attempts: 0, locked_until: null })
        .eq("user_id", uid);
      if (error) {
        if (isMissingTable(error)) throw tableMissingError();
        throw new Error(error.message || "Couldn't reset lockout attempts.");
      }
    },
    onSuccess: invalidate,
  });
}
