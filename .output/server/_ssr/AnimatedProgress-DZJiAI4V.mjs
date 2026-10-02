import { i as __toESM } from "../_runtime.mjs";
import { a as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { t as cn } from "./utils-CLFOCKAi.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Progress } from "./progress-DTdwfIPe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AnimatedProgress-DZJiAI4V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* shadcn Progress whose fill animates from 0 to `value` on change.
* Skips animation when the user prefers reduced motion.
* SSR-safe: animation runs in an effect only.
*/
function AnimatedProgress({ value, className }) {
	const [animated, setAnimated] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const target = Math.max(0, Math.min(100, value));
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setAnimated(target);
			return;
		}
		let raf = 0;
		const start = performance_default.now();
		const duration = 700;
		const tick = (now) => {
			const p = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			setAnimated(target * eased);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
		value: animated,
		className: cn(className)
	});
}
//#endregion
export { AnimatedProgress as t };
