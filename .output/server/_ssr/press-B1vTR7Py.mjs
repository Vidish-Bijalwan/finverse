//#region node_modules/.nitro/vite/services/ssr/assets/press-B1vTR7Py.js
/**
* Shared press feedback for tappable elements: ~120ms scale + brightness dip.
* The scale is motion-safe (skipped for prefers-reduced-motion); the
* brightness dip is an instant state change, not an animation.
*/
var pressable = "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95";
//#endregion
export { pressable as t };
