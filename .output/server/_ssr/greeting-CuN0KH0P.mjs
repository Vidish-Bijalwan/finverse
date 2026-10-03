//#region node_modules/.nitro/vite/services/ssr/assets/greeting-CuN0KH0P.js
/**
* Dashboard greeting helpers.
*
* `full_name` comes from OAuth / manual onboarding and is frequently junk
* ("ee", an email address, a handle). The greeting must show a real name or
* nothing at all — never a mangled fragment.
*/
/** Time-of-day greeting, e.g. "Good morning". */
function greetingFor(date) {
	const h = date.getHours();
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Keep only Latin letters (handles diacritics) for name-ish tokens. */
function lettersOnly(token) {
	return token.replace(/[^\p{L}]/gu, "");
}
function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
/**
* Display form of an accepted name token. The token's own casing is
* preserved — the only transformation ever applied is title-casing a fully
* lowercase token ("vidish" -> "Vidish"). Anything with real casing
* ("QA", "McDonald", "eBay") is returned untouched: lowercasing the tail
* ("QA" -> "Qa") destroys information and is never done.
*/
function displayToken(token) {
	if (token === token.toLowerCase()) return capitalize(token);
	return token;
}
/**
* Sanitize a candidate display name. Returns the usable first name, or ""
* when the candidate is not name-like.
*
* A token is accepted when it is ≥3 letters, or ≥2 letters with at least one
* uppercase letter (real short names like "Li" are kept as-is; lowercase
* fragments like "ee" are treated as garbage).
*/
function sanitizeNameToken(raw) {
	const token = (raw ?? "").trim().split(/\s+/)[0] ?? "";
	if (!token || EMAIL_RE.test(token)) return "";
	const letters = lettersOnly(token);
	if (letters.length >= 3) return displayToken(letters);
	if (letters.length >= 2 && letters !== letters.toLowerCase()) return displayToken(letters);
	return "";
}
/**
* Sanitized first name for the greeting. Prefers profile.full_name; falls
* back to the email's local part (e.g. "vidish.bijalwan" -> "Vidish");
* returns "" when neither is name-like.
*/
function greetingName(fullName, email) {
	const fromProfile = sanitizeNameToken(fullName);
	if (fromProfile) return fromProfile;
	return sanitizeNameToken(((email ?? "").trim().split("@")[0] ?? "").split(/[._\-+]+/).filter(Boolean)[0] ?? "");
}
//#endregion
export { greetingName as n, greetingFor as t };
