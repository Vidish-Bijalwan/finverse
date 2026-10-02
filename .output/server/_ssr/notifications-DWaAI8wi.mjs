import { t as cn } from "./utils-CLFOCKAi.mjs";
import { H as PiggyBank, Kt as Bell, Nt as CheckCheck, h as Target, ht as Flame, qt as BellRing, t as Zap, tt as Lightbulb, zt as CalendarClock } from "../_libs/lucide-react.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-CCJtu4Y5.mjs";
import { n as CardContent, t as Card } from "./card-CxSeJsg6.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useNotifications } from "./notify-CdhcCGG-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-DWaAI8wi.js
var import_jsx_runtime = require_jsx_runtime();
var GROUP_META = {
	bill: {
		label: "Bills due",
		icon: CalendarClock
	},
	budget: {
		label: "Budgets",
		icon: PiggyBank
	},
	goal: {
		label: "Goals",
		icon: Target
	},
	anomaly: {
		label: "Unusual spending",
		icon: Zap
	},
	streak: {
		label: "Streaks",
		icon: Flame
	},
	price: {
		label: "Price alerts",
		icon: BellRing
	},
	info: {
		label: "Updates",
		icon: Lightbulb
	}
};
var GROUP_ORDER = [
	"bill",
	"price",
	"budget",
	"goal",
	"anomaly",
	"streak",
	"info"
];
/** "2026-10-03T12:00:00.000Z" -> "3 Oct, 12:00" (local). */
function timeLabel(iso) {
	const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
	if (Number.isNaN(d.getTime())) return iso;
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const hh = String(d.getHours()).padStart(2, "0");
	const mm = String(d.getMinutes()).padStart(2, "0");
	const hasTime = iso.length > 10;
	return `${d.getDate()} ${months[d.getMonth()]}${hasTime ? `, ${hh}:${mm}` : ""}`;
}
function NotificationsPage() {
	const { notifications, unread, isRead, markAllRead } = useNotifications();
	const groups = GROUP_ORDER.map((kind) => ({
		kind,
		items: notifications.filter((n) => n.kind === kind)
	})).filter((g) => g.items.length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mt-2 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm font-bold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), " NOTIFICATIONS"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-black tracking-tight sm:text-3xl",
						children: unread > 0 ? `${unread} unread` : "You're all caught up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted-foreground",
						children: "Bills due, budget alerts, goal milestones, anomaly flags and streaks — generated from your real data."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "mt-1 shrink-0 gap-1.5",
					onClick: markAllRead,
					disabled: unread === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, {
						className: "size-4",
						"aria-hidden": true
					}), "Mark all read"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-6",
				children: [notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col items-center px-6 py-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-12 place-items-center rounded-full bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-6 text-primary" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-lg font-bold",
							children: "Nothing to flag right now"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground",
							children: "When a bill is due soon, a budget is nearly used up, a goal hits a milestone, or spending looks unusual, it will show up here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "mt-4",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/insights",
								children: "See AI insights"
							})
						})
					]
				}) }), groups.map((group) => {
					const meta = GROUP_META[group.kind];
					const GroupIcon = meta.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-label": meta.label,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupIcon, {
									className: "size-4",
									"aria-hidden": true
								}),
								meta.label,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-foreground",
									children: group.items.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 grid gap-3",
							children: group.items.map((n) => {
								const read = isRead(n.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: n.to,
									className: cn("flex gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:border-primary/40", read && "opacity-70"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("mt-1 size-2 shrink-0 rounded-full", read ? "bg-muted-foreground/40" : "bg-primary"),
										"aria-hidden": true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-sm font-bold leading-snug",
												children: n.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm leading-6 text-muted-foreground",
												children: n.body
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs text-muted-foreground",
												children: timeLabel(n.createdAt)
											})
										]
									})]
								}) }, n.id);
							})
						})]
					}, group.kind);
				})]
			})]
		})
	});
}
//#endregion
export { NotificationsPage as component };
