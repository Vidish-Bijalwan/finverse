import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { t as Button } from "./button-295GU9cE.mjs";
import { Dt as EyeOff, Et as Eye, Yt as ChartNoAxesCombined, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Input } from "./input-CR-lrKZF.mjs";
import { t as Label } from "./label-gcNTZ0Hv.mjs";
import { n as useAuth } from "./auth-D_1PFhAL.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BzIpkL0J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-KTCINrsa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
			})
		]
	});
}
function AuthForm({ mode }) {
	const { signIn, signUp } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [fieldErrors, setFieldErrors] = (0, import_react.useState)({});
	const [serverError, setServerError] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [signedUp, setSignedUp] = (0, import_react.useState)(false);
	const clearFieldError = (field) => setFieldErrors((prev) => {
		const next = { ...prev };
		delete next[field];
		return next;
	});
	const validate = () => {
		const errors = {};
		if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
		if (password.length < 8) errors.password = "Password must be at least 8 characters.";
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setServerError(null);
		setSignedUp(false);
		if (!validate()) return;
		setSubmitting(true);
		try {
			if (mode === "login") await signIn(email.trim(), password);
			else {
				await signUp(email.trim(), password);
				setSignedUp(true);
				setPassword("");
			}
		} catch (err) {
			setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		noValidate: true,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `${mode}-email`,
						children: "Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `${mode}-email`,
						type: "email",
						autoComplete: "email",
						placeholder: "you@example.com",
						value: email,
						onChange: (e) => {
							setEmail(e.target.value);
							clearFieldError("email");
						},
						"aria-invalid": !!fieldErrors.email,
						"aria-describedby": fieldErrors.email ? `${mode}-email-error` : void 0
					}),
					fieldErrors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: `${mode}-email-error`,
						role: "alert",
						className: "text-xs text-destructive",
						children: fieldErrors.email
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `${mode}-password`,
						children: "Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `${mode}-password`,
							type: showPassword ? "text" : "password",
							autoComplete: mode === "login" ? "current-password" : "new-password",
							placeholder: mode === "login" ? "Your password" : "At least 8 characters",
							value: password,
							onChange: (e) => {
								setPassword(e.target.value);
								clearFieldError("password");
							},
							className: "pr-10",
							"aria-invalid": !!fieldErrors.password,
							"aria-describedby": fieldErrors.password ? `${mode}-password-error` : void 0
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowPassword((v) => !v),
							className: `absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground ${pressable}`,
							"aria-label": showPassword ? "Hide password" : "Show password",
							children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
						})]
					}),
					fieldErrors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: `${mode}-password-error`,
						role: "alert",
						className: "text-xs text-destructive",
						children: fieldErrors.password
					})
				]
			}),
			serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
				children: serverError
			}),
			signedUp && !serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "rounded-md bg-success-soft px-3 py-2 text-xs text-success",
				children: "Account created! Check your email to confirm, then sign in."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				className: `w-full ${pressable}`,
				disabled: submitting,
				children: [submitting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "mr-2 size-4 animate-spin",
					"aria-hidden": "true"
				}), mode === "login" ? "Sign in" : "Create account"]
			})
		]
	});
}
function LoginPage() {
	const { user, profile, loading, signInWithGoogle } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("login");
	const [googleError, setGoogleError] = (0, import_react.useState)(null);
	const [googleLoading, setGoogleLoading] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	if (!loading && user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: profile?.onboarding_completed ? "/" : "/onboarding" });
	const handleGoogle = async () => {
		setGoogleError(null);
		setGoogleLoading(true);
		try {
			await signInWithGoogle();
		} catch (err) {
			setGoogleError(err instanceof Error ? err.message : "Google sign in failed. Please try again.");
			setGoogleLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: cn("fv-mesh fv-mesh-dark", !reducedMotion && "fv-mesh-animated")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-12 place-items-center rounded-xl bg-primary-dark shadow-logo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesCombined, {
								className: "size-6 text-background",
								strokeWidth: 2.5
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 text-2xl font-black tracking-tight text-white",
							children: ["Fin", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "Verse"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-white/70",
							children: "Clear, explainable insights for your financial life."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-card p-6 text-card-foreground shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							value: tab,
							onValueChange: (v) => setTab(v),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "grid w-full grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "login",
										children: "Sign in"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "signup",
										children: "Sign up"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "login",
									className: "pt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthForm, { mode: "login" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "signup",
									className: "pt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthForm, { mode: "signup" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-4 flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "or"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
							]
						}),
						googleError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mb-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							children: googleError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							className: `w-full ${pressable}`,
							onClick: handleGoogle,
							disabled: googleLoading || loading,
							children: [googleLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "mr-2 size-4 animate-spin",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), "Continue with Google"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-xs text-white/60",
					children: "Your data is stored securely and never shared."
				})
			]
		})]
	});
}
//#endregion
export { LoginPage as component };
