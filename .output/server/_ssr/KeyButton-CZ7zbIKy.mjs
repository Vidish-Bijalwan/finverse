import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as usePrefersReducedMotion } from "./use-prefers-reduced-motion-DhSVOQib.mjs";
import { t as cn } from "./utils-BDF8svUf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/KeyButton-CZ7zbIKy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Returns "press" when the DOM event should trigger the key, or null when it
* must be ignored (a compatibility click arriving after its pointerdown was
* already handled — acting on it would double-count the digit).
*/
function classifyPressEvent(kind, detail) {
	if (kind === "pointerdown") return "press";
	if (kind === "click" && detail === 0) return "press";
	return null;
}
/**
* Keypad key shared by NumericKeypad and PinPad.
*
* Acts on `pointerdown` (not `click`): touch browsers can swallow the click
* of a fast tap when they suspect a double-tap-zoom gesture, which dropped
* digits on rapid entry (e.g. 5,0,0 registering only ₹5). `preventDefault()`
* on the pointerdown suppresses the compatibility mouse events so the press
* is never double-counted; keyboard Enter/Space and assistive-tech
* activation fire `click` with `detail === 0` and are handled via the click
* path (see `classifyPressEvent`).
*
* `touch-manipulation` disables double-tap zoom on the key itself. The
* pressed visual is tracked in state (data-pressed) rather than relying on
* `:active`, which is unreliable once the pointerdown default is prevented.
*/
function KeyButton({ label, onPress, disabled = false, className, children }) {
	const [pressed, setPressed] = (0, import_react.useState)(false);
	const reduced = usePrefersReducedMotion();
	const pointerDownRef = (0, import_react.useRef)(false);
	const release = () => {
		pointerDownRef.current = false;
		setPressed(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		disabled,
		"data-pressed": pressed || void 0,
		onPointerDown: (e) => {
			if (disabled) return;
			e.preventDefault();
			pointerDownRef.current = true;
			setPressed(true);
			onPress();
		},
		onPointerUp: release,
		onPointerCancel: release,
		onPointerLeave: release,
		onClick: (e) => {
			if (disabled) return;
			if (classifyPressEvent("click", e.detail) === "press") onPress();
		},
		onBlur: release,
		className: cn("touch-manipulation select-none", !reduced && "transition-transform duration-120", "data-[pressed=true]:scale-[0.97] data-[pressed=true]:brightness-95", "disabled:cursor-not-allowed disabled:opacity-40", className),
		children
	});
}
//#endregion
export { KeyButton as t };
