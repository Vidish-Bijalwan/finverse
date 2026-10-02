import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-prefers-reduced-motion-DhSVOQib.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* True when the user prefers reduced motion. SSR-safe (defaults to false on
* the server, then syncs with the media query after hydration).
*/
function usePrefersReducedMotion() {
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		const onChange = (e) => setReduced(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	return reduced;
}
//#endregion
export { usePrefersReducedMotion as t };
