import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as ReceiptText, b as Sparkles, d as TrendingUp, nt as LayoutGrid, ot as House } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useLocation, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as useSettings } from "./settings-Be359HdD.mjs";
import { n as AppHeader } from "./AppHeader-pOGmEK-X.mjs";
import { t as Route$17 } from "./stocks._symbol-DbLGcUOR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-RfwYEyCW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DQL4gm4F.css";
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
		label: "Expenses",
		to: "/expenses",
		icon: ReceiptText
	},
	{
		label: "Insights",
		to: "/insights",
		icon: Sparkles
	},
	{
		label: "Portfolio",
		to: "/portfolio",
		icon: TrendingUp
	},
	{
		label: "More",
		to: "/more",
		icon: LayoutGrid
	}
];
/**
* Mobile-only fixed bottom tab bar. Active tab gets an animated indicator pill.
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
				activeOptions: tab.to === "/" ? { exact: true } : void 0,
				activeProps: { "data-active": "true" },
				className: cn("group relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", "text-muted-foreground transition-colors hover:text-foreground", "data-[active=true]:text-primary"),
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
function resolveIsDark(theme) {
	if (theme === "dark") return true;
	if (theme === "light") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
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
var Route$16 = createRootRouteWithContext()({
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
				href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
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
	const { queryClient } = Route$16.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeApplier, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-screen bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "pb-24 md:pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomTabBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
					richColors: true,
					position: "bottom-center"
				})
			]
		})]
	});
}
var $$splitComponentImporter$15 = () => import("./routes-ohBvRGLc.mjs");
var Route$15 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "FinVerse AI — Your Money, Clearly Explained" },
		{
			name: "description",
			content: "Track spending, understand investments, and make clearer financial decisions with explainable AI."
		},
		{
			property: "og:title",
			content: "FinVerse AI — Your Money, Clearly Explained"
		},
		{
			property: "og:description",
			content: "One clear view of your spending, investments, goals, and financial health."
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
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./accounts-CjIxKzlm.mjs");
var Route$14 = createFileRoute("/accounts")({
	head: () => ({ meta: [{ title: "Accounts — FinVerse AI" }, {
		name: "description",
		content: "Cash, UPI, and bank accounts with live balances. Transfer between them."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./bills-OiuTpyaf.mjs");
var Route$13 = createFileRoute("/bills")({
	head: () => ({ meta: [{ title: "Bills — FinVerse AI" }, {
		name: "description",
		content: "Track recurring bills, mark them paid, and stay ahead of due dates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
/** Local bill mutations: the shared hooks layer only exposes list + pay. */
var $$splitComponentImporter$12 = () => import("./budgets-BIiRiVdq.mjs");
var Route$12 = createFileRoute("/budgets")({
	head: () => ({ meta: [{ title: "Budgets — FinVerse AI" }, {
		name: "description",
		content: "Set monthly spending limits per category and track them."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./chat-BJloQuSn.mjs");
var Route$11 = createFileRoute("/chat")({
	head: () => ({ meta: [{ title: "AI Chat — FinVerse AI" }, {
		name: "description",
		content: "Ask FinVerse AI about your spending, budgets, bills, goals and portfolio."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./expenses-CiunDKmf.mjs");
var Route$10 = createFileRoute("/expenses")({
	head: () => ({ meta: [{ title: "Expenses — FinVerse AI" }, {
		name: "description",
		content: "Track every rupee: add, edit, and search your expenses and income."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
/**
* Row that reveals a Delete action on left-swipe (touch).
* Tapping the row opens the edit sheet; the delete target sits behind.
*/
/**
* DEMO STUB — receipt scan results.
* Plug a real OCR service (e.g. on-device ML Kit / a vision API) here:
* replace MOCK_RECEIPTS with the parsed { merchant, total } from the scan.
*/
var $$splitComponentImporter$9 = () => import("./goals-CuCgABD5.mjs");
var Route$9 = createFileRoute("/goals")({
	head: () => ({ meta: [{ title: "Goals — FinVerse AI" }, {
		name: "description",
		content: "Set savings goals, add funds, and track your pace."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
/**
* Project completion from the average monthly allocation to this goal over the
* last 3 calendar months (transfer transactions linked by goalId).
*/
var $$splitComponentImporter$8 = () => import("./insights-DE0hqT7r.mjs");
var Route$8 = createFileRoute("/insights")({
	head: () => ({ meta: [{ title: "AI Insights — FinVerse AI" }, {
		name: "description",
		content: "Explainable insights about your spending, budgets, bills, goals and savings."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./more-TP_F1Q8v.mjs");
var Route$7 = createFileRoute("/more")({
	head: () => ({ meta: [{ title: "More — FinVerse AI" }, {
		name: "description",
		content: "Browse every FinVerse AI feature from one menu."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./notifications-DWaAI8wi.mjs");
var Route$6 = createFileRoute("/notifications")({
	head: () => ({ meta: [{ title: "Notifications — FinVerse AI" }, {
		name: "description",
		content: "Bills due, budget alerts, goal milestones, anomalies and streaks — all in one place."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
/** "2026-10-03T12:00:00.000Z" -> "3 Oct, 12:00" (local). */
var $$splitComponentImporter$5 = () => import("./portfolio-JfMgZa0W.mjs");
var Route$5 = createFileRoute("/portfolio")({
	head: () => ({ meta: [{ title: "Portfolio — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
/** Per-holding dividend-yield overrides (percent), persisted by holding id. */
var $$splitComponentImporter$4 = () => import("./readiness-Dn8d5-6y.mjs");
var Route$4 = createFileRoute("/readiness")({
	head: () => ({ meta: [{ title: "Investment Readiness — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
/** "2026-10" minus n months -> "YYYY-MM". */
var $$splitComponentImporter$3 = () => import("./screener-MS8SjVAj.mjs");
var Route$3 = createFileRoute("/screener")({
	head: () => ({ meta: [{ title: "Stock Screener — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./settings-BA3SZxqc.mjs");
var Route$2 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./tools-dIYZGxbA.mjs");
var Route$1 = createFileRoute("/tools")({
	head: () => ({ meta: [{ title: "Tools — FinVerse AI" }, {
		name: "description",
		content: "Financial calculators: SIP, EMI, FD, income-tax estimator, emergency-fund planner and cash-flow forecast."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./watchlist-DWqRNjQq.mjs");
var Route = createFileRoute("/watchlist")({
	head: () => ({ meta: [{ title: "Watchlist — FinVerse AI" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$15.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$16
	}),
	AccountsRoute: Route$14.update({
		id: "/accounts",
		path: "/accounts",
		getParentRoute: () => Route$16
	}),
	BillsRoute: Route$13.update({
		id: "/bills",
		path: "/bills",
		getParentRoute: () => Route$16
	}),
	BudgetsRoute: Route$12.update({
		id: "/budgets",
		path: "/budgets",
		getParentRoute: () => Route$16
	}),
	ChatRoute: Route$11.update({
		id: "/chat",
		path: "/chat",
		getParentRoute: () => Route$16
	}),
	ExpensesRoute: Route$10.update({
		id: "/expenses",
		path: "/expenses",
		getParentRoute: () => Route$16
	}),
	GoalsRoute: Route$9.update({
		id: "/goals",
		path: "/goals",
		getParentRoute: () => Route$16
	}),
	InsightsRoute: Route$8.update({
		id: "/insights",
		path: "/insights",
		getParentRoute: () => Route$16
	}),
	MoreRoute: Route$7.update({
		id: "/more",
		path: "/more",
		getParentRoute: () => Route$16
	}),
	NotificationsRoute: Route$6.update({
		id: "/notifications",
		path: "/notifications",
		getParentRoute: () => Route$16
	}),
	PortfolioRoute: Route$5.update({
		id: "/portfolio",
		path: "/portfolio",
		getParentRoute: () => Route$16
	}),
	ReadinessRoute: Route$4.update({
		id: "/readiness",
		path: "/readiness",
		getParentRoute: () => Route$16
	}),
	ScreenerRoute: Route$3.update({
		id: "/screener",
		path: "/screener",
		getParentRoute: () => Route$16
	}),
	SettingsRoute: Route$2.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$16
	}),
	ToolsRoute: Route$1.update({
		id: "/tools",
		path: "/tools",
		getParentRoute: () => Route$16
	}),
	WatchlistRoute: Route.update({
		id: "/watchlist",
		path: "/watchlist",
		getParentRoute: () => Route$16
	}),
	StocksSymbolRoute: Route$17.update({
		id: "/stocks/$symbol",
		path: "/stocks/$symbol",
		getParentRoute: () => Route$16
	})
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
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
