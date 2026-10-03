import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
import { A as Send, R as ReceiptText, Tt as FingerprintPattern, Xt as ChartLine, Yt as ChartNoAxesCombined, mt as House, p as TrendingUp } from "../_libs/lucide-react.mjs";
import { t as pressable } from "./press-B1vTR7Py.mjs";
import { C as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useLocation, v as createFileRoute, x as Navigate, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$19 } from "./accounts-uLle7ohl.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BG_ycP85.mjs";
import { s as useSettings } from "./settings-Cxv5Jbfq.mjs";
import { t as Route$20 } from "./expenses-dMEzUyFz.mjs";
import { t as Route$21 } from "./goals-CGCV0tVQ.mjs";
import { n as useAuth, t as AuthProvider } from "./auth-D_1PFhAL.mjs";
import { n as AppHeader, r as resolveIsDark } from "./AppHeader-DSoPt694.mjs";
import { t as Route$22 } from "./payments-Dxk_fBxj.mjs";
import { a as isLockEnabled, c as useAppLock, d as useRecordFailedAttempt, f as useResetAttempts, h as verifyPin, n as PinPad, o as platformBiometricAvailable, r as assertBiometric } from "./applock-hooks-BqaUs1r-.mjs";
import { t as Route$23 } from "./stocks._symbol-D5dKaE9z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B131MuMr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CYWcoZsx.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
/**
* Full-screen app-lock overlay built on PinPad. Biometric button renders only
* when `biometricAvailable` is true. "Forgot passcode" routes to onReset.
*/
function AppLockScreen({ onComplete, error, disabled = false, cooldownSeconds = 0, biometricAvailable = false, onBiometric, onReset, appName = "FinVerse" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "App locked",
		className: "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-2 bg-background px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold text-primary-dark",
				children: appName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, {
				title: "Enter passcode",
				onComplete,
				error: error ?? null,
				disabled,
				cooldownSeconds
			}),
			biometricAvailable && onBiometric && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBiometric,
				disabled,
				className: "mt-2 flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, {
					className: "size-5",
					"aria-hidden": true
				}), "Use biometrics"]
			}),
			onReset && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onReset,
				className: "mt-4 text-sm font-semibold text-primary hover:underline",
				children: "Forgot passcode?"
			})
		]
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var TABS = [
	{
		label: "Home",
		to: "/",
		icon: House
	},
	{
		label: "Pay",
		to: "/payments",
		icon: Send
	},
	{
		label: "Invest",
		to: "/portfolio",
		icon: TrendingUp
	},
	{
		label: "Markets",
		to: "/watchlist",
		icon: ChartLine
	},
	{
		label: "Activity",
		to: "/expenses",
		icon: ReceiptText
	}
];
/**
* Mobile-only fixed bottom tab bar: Home / Pay / Invest / Markets / Activity.
* Active tab gets an animated indicator pill + aria-current.
*/
function BottomTabBar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Bottom tabs",
		className: "fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur md:hidden",
		style: { paddingBottom: "env(safe-area-inset-bottom)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-5",
			children: TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: tab.to,
				...tab.to === "/" ? { activeOptions: { exact: true } } : {},
				activeProps: {
					"data-active": "true",
					"aria-current": "page"
				},
				className: cn(pressable, "group relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium", "text-muted-foreground transition-colors hover:text-foreground", "data-[active=true]:text-primary"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: cn("absolute top-0 h-1 w-10 rounded-b-full bg-primary", "scale-x-0 transition-transform duration-200 ease-out", "group-data-[active=true]:scale-x-100")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, {
						className: "size-5",
						strokeWidth: 2.2
					}),
					tab.label
				]
			}, tab.label))
		})
	});
}
/**
* Subtle fade/slide wrapper around the routed page, keyed by pathname.
* Animations are skipped entirely when the user prefers reduced motion.
*/
function PageTransition({ children }) {
	const { pathname } = useLocation();
	const [reducedMotion, setReducedMotion] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(mq.matches);
		const onChange = (e) => setReducedMotion(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	if (reducedMotion) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-transition-enter",
		children
	}, pathname);
}
/**
* Mounted once at the app root (coordinator wires it into __root__).
* Reads the theme setting and toggles the `dark` class on
* document.documentElement; "system" follows the OS via matchMedia.
* Renders nothing.
*/
function ThemeApplier() {
	const [settings] = useSettings();
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		const apply = () => {
			const dark = resolveIsDark(settings.theme);
			root.classList.toggle("dark", dark);
			root.style.colorScheme = dark ? "dark" : "light";
		};
		apply();
		if (settings.theme === "system") {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			mq.addEventListener("change", apply);
			return () => mq.removeEventListener("change", apply);
		}
	}, [settings.theme]);
	return null;
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$18 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "FinVerse AI" },
			{
				name: "description",
				content: "Clear, explainable insights for your financial life."
			},
			{
				name: "author",
				content: "FinVerse AI"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: "FinVerse AI"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@finverse"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$18.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuardedShell, {}) })
	});
}
/** Paths that never require a signed-in user. */
var AUTH_OPEN_PATHS = ["/login", "/auth/callback"];
/** Focused flows that render without the app chrome (header / bottom tabs). */
var BARE_CHROME_PATHS = [
	"/login",
	"/auth/callback",
	"/onboarding"
];
function SplashScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background",
		role: "status",
		"aria-label": "Loading FinVerse",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-14 place-items-center rounded-xl bg-primary-dark shadow-logo",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesCombined, {
						className: "size-8 text-background",
						strokeWidth: 2.5
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-2xl font-black text-primary-dark",
					children: ["Fin", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "Verse"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none" })
			]
		})
	});
}
function GuardedShell() {
	const { user, profile, loading } = useAuth();
	const { pathname } = useLocation();
	const bare = BARE_CHROME_PATHS.includes(pathname);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, {});
	if (!user && !AUTH_OPEN_PATHS.includes(pathname)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
		richColors: true,
		position: "bottom-center"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" })] });
	if (user && profile && !profile.onboarding_completed && !["/onboarding", ...AUTH_OPEN_PATHS].includes(pathname)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/onboarding" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLockGate, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeApplier, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: bare ? void 0 : "pb-24 md:pb-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
			}),
			!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomTabBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				richColors: true,
				position: "bottom-center"
			})
		]
	})] });
}
/**
* App-lock gate. Renders after the existing auth/onboarding guards.
*
* Lock conditions: app lock enabled (pin_hash set) AND (the tab was
* backgrounded longer than timeout_secs, or an explicit "lock now" request
* arrived via the "finverse:lock-now" window event, e.g. from Settings).
*
* Last-active time lives only in memory (never localStorage) — closing the
* tab forgets it. Unlock verifies the PIN against the stored PBKDF2 digest;
* 5 consecutive wrong entries impose a 30s cooldown recorded in the DB.
*
* "Forgot passcode?" is a recovery path, not a backdoor: it signs the user
* OUT and routes to /login so they must re-authenticate with Supabase before
* they can set a new passcode. The sessionStorage key
* "finverse:applock-reset-notice" carries the notice for /login to display.
*/
function AppLockGate({ children }) {
	const { user, signOut } = useAuth();
	const lock = useAppLock();
	const recordFailed = useRecordFailedAttempt();
	const resetAttempts = useResetAttempts();
	const row = lock.data?.row ?? null;
	const enabled = isLockEnabled(row);
	const timeoutSecs = row?.timeout_secs ?? 120;
	const [locked, setLocked] = (0, import_react.useState)(false);
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [bioAvailable, setBioAvailable] = (0, import_react.useState)(false);
	const [showResetConfirm, setShowResetConfirm] = (0, import_react.useState)(false);
	const backgroundedAtRef = (0, import_react.useRef)(null);
	const enabledRef = (0, import_react.useRef)(enabled);
	enabledRef.current = enabled;
	const timeoutRef = (0, import_react.useRef)(timeoutSecs);
	timeoutRef.current = timeoutSecs;
	(0, import_react.useEffect)(() => {
		if (!enabled) setLocked(false);
	}, [enabled]);
	(0, import_react.useEffect)(() => {
		const onHidden = () => {
			backgroundedAtRef.current = Date.now();
		};
		const onVisible = () => {
			const started = backgroundedAtRef.current;
			backgroundedAtRef.current = null;
			if (started == null) return;
			const awaySecs = (Date.now() - started) / 1e3;
			if (enabledRef.current && awaySecs >= timeoutRef.current) {
				setError(null);
				setLocked(true);
			}
		};
		const onLockNow = () => {
			if (enabledRef.current) {
				setError(null);
				setLocked(true);
			}
		};
		const onVisibility = () => {
			if (document.hidden) onHidden();
			else onVisible();
		};
		document.addEventListener("visibilitychange", onVisibility);
		window.addEventListener("pagehide", onHidden);
		window.addEventListener("finverse:lock-now", onLockNow);
		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
			window.removeEventListener("pagehide", onHidden);
			window.removeEventListener("finverse:lock-now", onLockNow);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (enabled && row?.biometric_enabled) platformBiometricAvailable().then((ok) => {
			if (!cancelled) setBioAvailable(ok);
		});
		else setBioAvailable(false);
		return () => {
			cancelled = true;
		};
	}, [enabled, row?.biometric_enabled]);
	const cooldownRemainingSecs = (() => {
		if (!row?.locked_until) return 0;
		return Math.max(0, Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1e3));
	})();
	async function handleComplete(pin) {
		if (!row || cooldownRemainingSecs > 0) return;
		setVerifying(true);
		setError(null);
		try {
			if (await verifyPin(pin, row.pin_salt, row.pin_hash)) {
				await resetAttempts.mutateAsync();
				setLocked(false);
				backgroundedAtRef.current = null;
			} else {
				const r = await recordFailed.mutateAsync();
				if (r.lockedOut) setError(`Too many wrong attempts — locked for 30 seconds.`);
				else {
					const left = 5 - r.failed_attempts;
					setError(`Wrong passcode — ${left} attempt${left === 1 ? "" : "s"} left before a 30-second lockout.`);
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Couldn't verify the passcode. Try again.");
		} finally {
			setVerifying(false);
		}
	}
	async function handleBiometric() {
		if (!user || cooldownRemainingSecs > 0) return;
		setVerifying(true);
		setError(null);
		try {
			await assertBiometric(user.id);
			await resetAttempts.mutateAsync();
			setLocked(false);
			backgroundedAtRef.current = null;
		} catch (e) {
			setError(e instanceof Error ? `${e.message} Use your passcode instead.` : "Biometric unlock failed — use your passcode instead.");
		} finally {
			setVerifying(false);
		}
	}
	async function handleResetConfirm() {
		setShowResetConfirm(false);
		try {
			window.sessionStorage.setItem("finverse:applock-reset-notice", "1");
		} catch {}
		toast.info("Signed out. Sign back in, then set a new passcode in Settings → App lock.");
		await signOut();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		children,
		locked && enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLockScreen, {
			onComplete: (pin) => void handleComplete(pin),
			error,
			disabled: verifying || cooldownRemainingSecs > 0,
			cooldownSeconds: cooldownRemainingSecs,
			biometricAvailable: bioAvailable,
			onBiometric: () => void handleBiometric(),
			onReset: () => setShowResetConfirm(true)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: showResetConfirm,
			onOpenChange: setShowResetConfirm,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Reset your passcode?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "For your security, this signs you out of FinVerse completely. Sign back in with your account credentials, then set a new passcode in Settings → App lock. There is no master code and support cannot recover a forgotten passcode." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: () => void handleResetConfirm(),
				children: "Sign me out"
			})] })] })
		})
	] });
}
var $$splitComponentImporter$16 = () => import("./routes-45QNLFNG.mjs");
var Route$17 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "FinVerse AI — Dashboard" },
		{
			name: "description",
			content: "Your money in one clear view: net worth, monthly cash flow, investments, and recent activity."
		},
		{
			property: "og:title",
			content: "FinVerse AI — Dashboard"
		},
		{
			property: "og:description",
			content: "Net worth, spending, investments, and AI insights in one clear view."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
/** Money display that honors the persisted privacy preference. */
/** One compact hero metric (label + value). Keeps the hero's second row small. */
/** Consistent card chrome (mirrors ChartCard's radius/border/shadow/heading). */
var $$splitComponentImporter$15 = () => import("./bills-0v_8nLux.mjs");
var Route$16 = createFileRoute("/bills")({
	head: () => ({ meta: [{ title: "Bills — FinVerse AI" }, {
		name: "description",
		content: "Track recurring bills, mark them paid, and stay ahead of due dates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
/** Local bill mutations: the shared hooks layer only exposes list + pay. */
var $$splitComponentImporter$14 = () => import("./budgets-BGU6syU_.mjs");
var Route$15 = createFileRoute("/budgets")({
	head: () => ({ meta: [{ title: "Budgets — FinVerse AI" }, {
		name: "description",
		content: "Set monthly spending limits per category and track them."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./chat-Bx7L0sqj.mjs");
var Route$14 = createFileRoute("/chat")({
	head: () => ({ meta: [{ title: "AI Chat — FinVerse AI" }, {
		name: "description",
		content: "Ask FinVerse AI about your spending, budgets, bills, goals and portfolio."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./insights-UfSGSEYt.mjs");
var Route$13 = createFileRoute("/insights")({
	head: () => ({ meta: [{ title: "AI Insights — FinVerse AI" }, {
		name: "description",
		content: "Explainable insights about your spending, budgets, bills, goals and savings."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./login-KTCINrsa.mjs");
var Route$12 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./more-CbpTS-db.mjs");
var Route$11 = createFileRoute("/more")({
	head: () => ({ meta: [{ title: "More — FinVerse AI" }, {
		name: "description",
		content: "Browse every FinVerse AI feature from one menu."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./notifications-2S5dQQk6.mjs");
var Route$10 = createFileRoute("/notifications")({
	head: () => ({ meta: [{ title: "Notifications — FinVerse AI" }, {
		name: "description",
		content: "Bills due, budget alerts, goal milestones, anomalies and streaks — all in one place."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
/** "2026-10-03T12:00:00.000Z" -> "3 Oct, 12:00" (local). */
var $$splitComponentImporter$8 = () => import("./onboarding-yavzSrfF.mjs");
var Route$9 = createFileRoute("/onboarding")({
	head: () => ({ meta: [{ title: "Get started — FinVerse AI" }, {
		name: "description",
		content: "Set up your FinVerse AI profile in four quick steps."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./portfolio-Bo6cG7bh.mjs");
var Route$8 = createFileRoute("/portfolio")({
	head: () => ({ meta: [{ title: "Portfolio — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./profile-3RR8bsE-.mjs");
var Route$7 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile — FinVerse AI" }, {
		name: "description",
		content: "Manage your FinVerse AI profile."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
/** Avatar initials via the shared rule (`@/lib/names`): first letters of the
* first two words, uppercased — "QA Test Beneficiary" -> "QT". */
var $$splitComponentImporter$5 = () => import("./readiness-BIdSul7B.mjs");
var Route$6 = createFileRoute("/readiness")({
	head: () => ({ meta: [{ title: "Investment Readiness — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
/** "2026-10" minus n months -> "YYYY-MM". */
var $$splitComponentImporter$4 = () => import("./screener-DAY-vVDB.mjs");
var Route$5 = createFileRoute("/screener")({
	head: () => ({ meta: [{ title: "Stock Screener — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./settings-Bbdu9SNp.mjs");
var Route$4 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
/**
* App lock settings section (PIN + auto-lock timeout + biometrics).
*
* Honest states: if the `app_lock` table is missing (migration not run) the
* section says so plainly instead of faking a toggle. The biometric switch
* renders only when the device actually has a user-verifying authenticator.
*/
var $$splitComponentImporter$2 = () => import("./tools-jCiOygzu.mjs");
var Route$3 = createFileRoute("/tools")({
	head: () => ({ meta: [{ title: "Tools — FinVerse AI" }, {
		name: "description",
		content: "Financial calculators: SIP, EMI, FD, income-tax estimator, emergency-fund planner and cash-flow forecast."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./watchlist-Doo2PtpU.mjs");
var Route$2 = createFileRoute("/watchlist")({
	head: () => ({ meta: [{ title: "Watchlist — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
/**
* Razorpay webhook endpoint — POST /api/razorpay-webhook.
*
* This is a raw request handler (NOT a createServerFn): the framework's
* server-function context does not expose the raw Request body needed for
* HMAC-SHA256 verification, and the app's CSRF middleware only guards
* serverFn handlers — Razorpay's cross-origin POSTs must reach this route
* untouched. See src/lib/razorpay.server.ts for the full rationale.
*
* The handler logic is dynamically imported so the node:crypto /
* service-role Supabase code never lands in the client bundle (the client
* never executes this handler).
*
* Configure in the Razorpay dashboard (test mode):
*   Webhook URL: https://<your-app>/api/razorpay-webhook
*   Events: payment.authorized, payment.captured, payment.failed
*   Secret: must match RAZORPAY_KEY_SECRET in the server environment.
*/
var Route$1 = createFileRoute("/api/razorpay-webhook")({ server: { handlers: { POST: async ({ request }) => {
	const { handleRazorpayWebhook } = await import("./razorpay-webhook-DuI9GMG3.mjs");
	return handleRazorpayWebhook(request);
} } } });
var $$splitComponentImporter = () => import("./auth.callback-BZND4ZjV.mjs");
var Route = createFileRoute("/auth/callback")({
	head: () => ({ meta: [{ title: "Signing you in — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$17.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$18
	}),
	AccountsRoute: Route$19.update({
		id: "/accounts",
		path: "/accounts",
		getParentRoute: () => Route$18
	}),
	BillsRoute: Route$16.update({
		id: "/bills",
		path: "/bills",
		getParentRoute: () => Route$18
	}),
	BudgetsRoute: Route$15.update({
		id: "/budgets",
		path: "/budgets",
		getParentRoute: () => Route$18
	}),
	ChatRoute: Route$14.update({
		id: "/chat",
		path: "/chat",
		getParentRoute: () => Route$18
	}),
	ExpensesRoute: Route$20.update({
		id: "/expenses",
		path: "/expenses",
		getParentRoute: () => Route$18
	}),
	GoalsRoute: Route$21.update({
		id: "/goals",
		path: "/goals",
		getParentRoute: () => Route$18
	}),
	InsightsRoute: Route$13.update({
		id: "/insights",
		path: "/insights",
		getParentRoute: () => Route$18
	}),
	LoginRoute: Route$12.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$18
	}),
	MoreRoute: Route$11.update({
		id: "/more",
		path: "/more",
		getParentRoute: () => Route$18
	}),
	NotificationsRoute: Route$10.update({
		id: "/notifications",
		path: "/notifications",
		getParentRoute: () => Route$18
	}),
	OnboardingRoute: Route$9.update({
		id: "/onboarding",
		path: "/onboarding",
		getParentRoute: () => Route$18
	}),
	PaymentsRoute: Route$22.update({
		id: "/payments",
		path: "/payments",
		getParentRoute: () => Route$18
	}),
	PortfolioRoute: Route$8.update({
		id: "/portfolio",
		path: "/portfolio",
		getParentRoute: () => Route$18
	}),
	ProfileRoute: Route$7.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$18
	}),
	ReadinessRoute: Route$6.update({
		id: "/readiness",
		path: "/readiness",
		getParentRoute: () => Route$18
	}),
	ScreenerRoute: Route$5.update({
		id: "/screener",
		path: "/screener",
		getParentRoute: () => Route$18
	}),
	SettingsRoute: Route$4.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$18
	}),
	ToolsRoute: Route$3.update({
		id: "/tools",
		path: "/tools",
		getParentRoute: () => Route$18
	}),
	WatchlistRoute: Route$2.update({
		id: "/watchlist",
		path: "/watchlist",
		getParentRoute: () => Route$18
	}),
	ApiRazorpayWebhookRoute: Route$1.update({
		id: "/api/razorpay-webhook",
		path: "/api/razorpay-webhook",
		getParentRoute: () => Route$18
	}),
	AuthCallbackRoute: Route.update({
		id: "/auth/callback",
		path: "/auth/callback",
		getParentRoute: () => Route$18
	}),
	StocksSymbolRoute: Route$23.update({
		id: "/stocks/$symbol",
		path: "/stocks/$symbol",
		getParentRoute: () => Route$18
	})
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
