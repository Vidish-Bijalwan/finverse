import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-BG_ycP85.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConfirmDeleteDialog-Cr1Ju050.js
var import_jsx_runtime = require_jsx_runtime();
/** Confirm-before-delete dialog used by bills and goals. */
function ConfirmDeleteDialog({ open, onOpenChange, title, description, onConfirm, pending }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: description })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: pending,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: onConfirm,
			disabled: pending,
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: pending ? "Deleting…" : "Delete"
		})] })] })
	});
}
//#endregion
export { ConfirmDeleteDialog as t };
