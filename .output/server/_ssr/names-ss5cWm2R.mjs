//#region node_modules/.nitro/vite/services/ssr/assets/names-ss5cWm2R.js
/**
* Initials for an avatar circle from a display name.
* Pure and total: null/undefined/blank input yields the FV monogram.
*/
function avatarInitials(name) {
	const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "FV";
	const first = words[0] ?? "";
	if (words.length === 1) return first.slice(0, 2).toUpperCase() || "FV";
	const second = words[1] ?? "";
	return (first.charAt(0) + second.charAt(0)).toUpperCase() || "FV";
}
//#endregion
export { avatarInitials as t };
