import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as TriangleAlert, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.callback-BZND4ZjV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthCallbackPage() {
	const navigate = useNavigate();
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const { error: exchangeError } = await getSupabase().auth.exchangeCodeForSession(window.location.href);
				if (exchangeError) throw new Error(exchangeError.message || "Could not complete sign in.");
				if (!cancelled) await navigate({ to: "/onboarding" });
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Could not complete sign in.");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[calc(100vh-4rem)] items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-card",
			children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "mx-auto size-8 text-destructive",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-lg font-semibold",
					children: "Sign in didn't work"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-2 text-sm text-muted-foreground",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
					children: "Back to sign in"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "mx-auto size-8 animate-spin text-primary",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-lg font-semibold",
					children: "Signing you in…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Finishing up with Google — you'll be redirected shortly."
				})
			] })
		})
	});
}
//#endregion
export { AuthCallbackPage as component };
