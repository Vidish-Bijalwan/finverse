import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { $t as Camera, at as LogOut } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { S as useNavigate, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { t as avatarInitials } from "./names-ss5cWm2R.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-zibXeSp6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-3RR8bsE-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var MAX_AVATAR_BYTES = 5242880;
/** Avatar initials via the shared rule (`@/lib/names`): first letters of the
* first two words, uppercased — "QA Test Beneficiary" -> "QT". */
function initialsOf(name, email) {
	const src = (name ?? "").trim() || (email ?? "").trim();
	return avatarInitials(src || null);
}
function formatMemberSince(createdAt) {
	if (!createdAt) return "—";
	const d = new Date(createdAt);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
function ProfilePage() {
	const { user, profile, loading, signOut } = useAuth();
	const navigate = useNavigate();
	const fileRef = (0, import_react.useRef)(null);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFullName(profile?.full_name ?? "");
		setBio(profile?.bio ?? "");
		setPhone(profile?.phone ?? "");
		setAvatarUrl(profile?.avatar_url ?? null);
	}, [profile]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-[60vh] place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-10 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none",
			role: "status",
			"aria-label": "Loading profile"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	const userId = user.id;
	const initials = initialsOf(profile?.full_name ?? null, user.email);
	async function handleAvatarFile(e) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file.");
			return;
		}
		if (file.size > MAX_AVATAR_BYTES) {
			toast.error("The photo must be under 5 MB.");
			return;
		}
		const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
		const path = `${userId}/avatar.${ext}`;
		setUploading(true);
		try {
			const supabase = getSupabase();
			const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
			if (uploadError) throw uploadError;
			const { data } = supabase.storage.from("avatars").getPublicUrl(path);
			const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
			const { error: dbError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
			if (dbError) throw dbError;
			setAvatarUrl(publicUrl);
			toast.success("Profile photo updated.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't upload the photo.");
		} finally {
			setUploading(false);
		}
	}
	async function handleSave() {
		setSaving(true);
		try {
			const { error } = await getSupabase().from("profiles").update({
				full_name: fullName.trim() || null,
				bio: bio.trim() || null,
				phone: phone.trim() || null
			}).eq("id", userId);
			if (error) throw error;
			toast.success("Profile saved.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save your profile.");
		} finally {
			setSaving(false);
		}
	}
	async function handleLogout() {
		try {
			await signOut();
		} finally {
			navigate({ to: "/login" });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-black tracking-tight text-foreground",
				children: "Profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "How you appear in FinVerse AI."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex items-center gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileRef.current?.click(),
					"aria-label": "Change profile photo",
					disabled: uploading,
					className: `group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-primary ${pressable}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
							className: "size-24",
							children: [avatarUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
								src: avatarUrl,
								alt: fullName || "Profile photo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "bg-primary text-2xl font-bold text-primary-foreground",
								children: initials
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 grid place-items-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-6 text-white" })
						}),
						uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 grid place-items-center rounded-full bg-black/45",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-6 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-bold text-foreground",
						children: fullName || "Your name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: user.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						disabled: uploading,
						className: `mt-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 ${pressable}`,
						children: uploading ? "Uploading…" : "Change photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: handleAvatarFile,
						"aria-hidden": "true",
						tabIndex: -1
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-name",
							children: "Display name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "profile-name",
							value: fullName,
							onChange: (e) => setFullName(e.target.value),
							placeholder: "Your name",
							autoComplete: "name",
							maxLength: 80
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-bio",
							children: "Bio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "profile-bio",
							value: bio,
							onChange: (e) => setBio(e.target.value),
							placeholder: "A line about you and your money goals",
							rows: 3,
							maxLength: 280
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-phone",
							children: "Phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "profile-phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "+91 …",
							autoComplete: "tel",
							inputMode: "tel",
							maxLength: 20
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "profile-email",
							value: user.email ?? "",
							readOnly: true,
							disabled: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Member since ", formatMemberSince(user.created_at)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: `mt-6 w-full ${pressable}`,
				onClick: handleSave,
				disabled: saving || uploading,
				children: saving ? "Saving…" : "Save changes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: `mt-3 w-full text-destructive hover:text-destructive ${pressable}`,
				onClick: handleLogout,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Log out"]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
