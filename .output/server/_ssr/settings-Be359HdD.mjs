import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Be359HdD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SETTINGS_KEY = "finverse:settings:v1";
var DEFAULT_SETTINGS = {
	theme: "system",
	monthStartDay: 1
};
var isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
var THEMES = [
	"light",
	"dark",
	"system"
];
function isValidSettings(v) {
	if (typeof v !== "object" || v === null) return false;
	const s = v;
	const theme = s["theme"];
	const monthStartDay = s["monthStartDay"];
	return typeof theme === "string" && THEMES.includes(theme) && typeof monthStartDay === "number" && Number.isInteger(monthStartDay) && monthStartDay >= 1 && monthStartDay <= 28;
}
/** Read settings. SSR-safe: returns defaults on the server. */
function getSettings() {
	return readSettingsSnapshot();
}
/**
* Snapshot reader for useSyncExternalStore. React requires getSnapshot to
* return a CACHED value — returning a fresh object on every call makes
* useSyncExternalStore re-render in an infinite loop ("Maximum update depth
* exceeded"). The snapshot is keyed on the raw localStorage string: unchanged
* storage -> identical object reference; changed storage -> re-parsed once.
* Do not mutate the returned object; use setSettings() to change settings.
*/
var snapshotRaw;
var snapshotSettings = DEFAULT_SETTINGS;
function readSettingsSnapshot() {
	const raw = isBrowser() ? window.localStorage.getItem(SETTINGS_KEY) : null;
	if (raw === snapshotRaw) return snapshotSettings;
	snapshotRaw = raw;
	if (!raw) {
		snapshotSettings = DEFAULT_SETTINGS;
		return snapshotSettings;
	}
	try {
		const parsed = JSON.parse(raw);
		snapshotSettings = isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
	} catch {
		snapshotSettings = DEFAULT_SETTINGS;
	}
	return snapshotSettings;
}
var listeners = /* @__PURE__ */ new Set();
function emit() {
	for (const l of listeners) l();
}
/** Persist a settings patch. No-op on the server. */
function setSettings(patch) {
	const next = {
		...getSettings(),
		...patch
	};
	if (next.monthStartDay < 1 || next.monthStartDay > 28 || !Number.isInteger(next.monthStartDay)) throw new Error("monthStartDay must be an integer between 1 and 28");
	if (isBrowser()) {
		window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
		emit();
	}
	return next;
}
function subscribeSettings(listener) {
	listeners.add(listener);
	const onStorage = (e) => {
		if (e.key === "finverse:settings:v1") listener();
	};
	if (isBrowser()) window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		if (isBrowser()) window.removeEventListener("storage", onStorage);
	};
}
/** Reactive settings hook. Returns [settings, updateSettings]. */
function useSettings() {
	return [(0, import_react.useSyncExternalStore)(subscribeSettings, getSettings, getSettings), (0, import_react.useCallback)((patch) => setSettings(patch), [])];
}
/** Clamp a month-start day to the supported 1-28 range. */
function clampMonthStartDay(day) {
	if (!Number.isInteger(day)) return 1;
	return Math.min(28, Math.max(1, day));
}
function csvEscape(value) {
	const s = String(value);
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
}
/** Build a transactions CSV with proper quoting/escaping. */
function buildTransactionsCSV(transactions) {
	const header = [
		"id",
		"type",
		"date",
		"note",
		"category",
		"amount_paise",
		"amount_inr",
		"pay_mode",
		"goal_id",
		"bill_id",
		"created_at"
	];
	const lines = transactions.map((t) => [
		csvEscape(t.id),
		csvEscape(t.type),
		csvEscape(t.dateISO),
		csvEscape(t.note),
		csvEscape(t.category),
		t.amountPaise,
		(t.amountPaise / 100).toFixed(2),
		csvEscape(t.payMode),
		csvEscape(t.goalId ?? ""),
		csvEscape(t.billId ?? ""),
		csvEscape(t.createdAt)
	].join(","));
	return `${header.join(",")}\n${lines.join("\n")}\n`;
}
function buildBackup(settings, db) {
	return {
		app: "finverse",
		kind: "finverse-backup",
		version: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		settings,
		db
	};
}
var TXN_TYPES = [
	"expense",
	"income",
	"transfer"
];
function isObject(v) {
	return typeof v === "object" && v !== null;
}
function isPaise(v) {
	return typeof v === "number" && Number.isInteger(v) && v >= 0;
}
/** Validate a parsed backup file. Returns human-readable errors ([] = valid). */
function validateBackup(parsed) {
	const errors = [];
	if (!isObject(parsed)) return ["The file does not contain a valid backup object."];
	if (parsed["app"] !== "finverse" || parsed["kind"] !== "finverse-backup") return ["This file is not a FinVerse backup (missing backup header)."];
	if (parsed["version"] !== 1) return [`Unsupported backup version ${String(parsed["version"])} — this build reads version 1 backups only.`];
	const db = parsed["db"];
	if (!isObject(db)) return ["The backup is missing its data section."];
	for (const key of [
		"transactions",
		"budgets",
		"bills",
		"goals",
		"holdings"
	]) if (!Array.isArray(db[key])) errors.push(`Data section "${key}" is missing or not a list.`);
	if (errors.length > 0) return errors;
	db["transactions"].forEach((t, i) => {
		if (!isObject(t)) {
			errors.push(`Transaction #${i + 1} is not an object.`);
			return;
		}
		if (typeof t["id"] !== "string") errors.push(`Transaction #${i + 1} is missing an id.`);
		if (typeof t["type"] !== "string" || !TXN_TYPES.includes(t["type"])) errors.push(`Transaction #${i + 1} has an invalid type "${String(t["type"])}".`);
		if (!isPaise(t["amountPaise"])) errors.push(`Transaction #${i + 1} has an invalid amount (must be integer paise ≥ 0).`);
		if (typeof t["dateISO"] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t["dateISO"])) errors.push(`Transaction #${i + 1} has an invalid date "${String(t["dateISO"])}".`);
	});
	const settingsRaw = parsed["settings"];
	if (isObject(settingsRaw)) {
		const d = settingsRaw["monthStartDay"];
		if (d !== void 0) {
			if (typeof d !== "number" || !Number.isInteger(d) || d < 1 || d > 28) errors.push("Backup settings contain an invalid month-start day.");
		}
	}
	return errors;
}
//#endregion
export { getSettings as a, validateBackup as c, clampMonthStartDay as i, buildBackup as n, setSettings as o, buildTransactionsCSV as r, useSettings as s, DEFAULT_SETTINGS as t };
