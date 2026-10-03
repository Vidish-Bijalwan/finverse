globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx+unenv.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"1d5-qGYR1LoCPlNB5Yg47/Fx/ksTVug\"",
		"mtime": "2026-10-03T11:25:46.358Z",
		"size": 469,
		"path": "../public/favicon.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-10-03T11:25:46.358Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/AccountDialog-CWdHGtMK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1694-4qTGIm6VtH9JZr0NredayQcxv14\"",
		"mtime": "2026-10-03T11:25:43.185Z",
		"size": 5780,
		"path": "../public/assets/AccountDialog-CWdHGtMK.js"
	},
	"/assets/AnimatedProgress-hLt9Btds.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d-hjqDO3tU9xdvbkABo7EJJOiH8uo\"",
		"mtime": "2026-10-03T11:25:43.186Z",
		"size": 621,
		"path": "../public/assets/AnimatedProgress-hLt9Btds.js"
	},
	"/assets/AreaChart-Clv2jSuw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ae3-gSdDKPecFm7Pl9SNFi+k7/ivR6U\"",
		"mtime": "2026-10-03T11:25:43.187Z",
		"size": 10979,
		"path": "../public/assets/AreaChart-Clv2jSuw.js"
	},
	"/assets/BarChart-BaOewD49.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-F95NG//9vnYcqW7wWbSojeaKGIo\"",
		"mtime": "2026-10-03T11:25:43.187Z",
		"size": 345,
		"path": "../public/assets/BarChart-BaOewD49.js"
	},
	"/assets/BottomSheet-DLWZ3iNj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2b-UjUENH2/a4YCvYI/MYJde5+Lkd8\"",
		"mtime": "2026-10-03T11:25:43.187Z",
		"size": 3115,
		"path": "../public/assets/BottomSheet-DLWZ3iNj.js"
	},
	"/assets/CashFlowChart-B35Wasvx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6f0-R6OM2ruy+H0PTnZOYN5aVj+6W/o\"",
		"mtime": "2026-10-03T11:25:43.187Z",
		"size": 1776,
		"path": "../public/assets/CashFlowChart-B35Wasvx.js"
	},
	"/assets/CategorySelect-CN0XYy8b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"317-6zPXEDRHQrMB0CZgTzYFcN48RZU\"",
		"mtime": "2026-10-03T11:25:43.187Z",
		"size": 791,
		"path": "../public/assets/CategorySelect-CN0XYy8b.js"
	},
	"/assets/ConfirmDeleteDialog-sk9TeP8A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-HNRApyHN3cY3x8v0YEscstvg9A8\"",
		"mtime": "2026-10-03T11:25:43.194Z",
		"size": 626,
		"path": "../public/assets/ConfirmDeleteDialog-sk9TeP8A.js"
	},
	"/assets/DonutAllocation-ClWYWEEx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"871-a+X0+kRHiwtuBZe7BIXUgA/DaC0\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 2161,
		"path": "../public/assets/DonutAllocation-ClWYWEEx.js"
	},
	"/assets/EmptyState-6EWH33NX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d-cpGUdOZJjTlmLeR1yxtw7U4CP2I\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 1805,
		"path": "../public/assets/EmptyState-6EWH33NX.js"
	},
	"/assets/ErrorState-Dy9GZMiu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"46a-WZk3PY0DbZc6PwecuRjaQuJOTqI\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 1130,
		"path": "../public/assets/ErrorState-Dy9GZMiu.js"
	},
	"/assets/MarketRow-BMsu7J0q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"914-6NvpqCct5ZMd+7mGeP/+LvcaF+Q\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 2324,
		"path": "../public/assets/MarketRow-BMsu7J0q.js"
	},
	"/assets/PageShell-BIidvijP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d7-0L3y0wzqRYG8XL1K0TXGaZ6BPVw\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 727,
		"path": "../public/assets/PageShell-BIidvijP.js"
	},
	"/assets/PieChart-CRTUhHPD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64ca-kTl1cxN8wWUzgmpKeRtN3wbYG2A\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 25802,
		"path": "../public/assets/PieChart-CRTUhHPD.js"
	},
	"/assets/NetWorthSpark-CmkXzHEy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b2-WXqCapW139udMeAAAMR9LJC6bFc\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 1970,
		"path": "../public/assets/NetWorthSpark-CmkXzHEy.js"
	},
	"/assets/Pill-n0AbIAk8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d3e-zSwGv9/eirpw1Wby516qtEruBpQ\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 3390,
		"path": "../public/assets/Pill-n0AbIAk8.js"
	},
	"/assets/PortfolioChart-CjAKcrG7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb2-AF67VV6fYo84yv4T+SBw45NUGlU\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 4018,
		"path": "../public/assets/PortfolioChart-CjAKcrG7.js"
	},
	"/assets/PullToRefresh-CI0U3_by.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"904-uUSzXImjSVchXfhxtw6XQVH/uJE\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 2308,
		"path": "../public/assets/PullToRefresh-CI0U3_by.js"
	},
	"/assets/SearchDropdown-Do3lMs5A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"caf-jR3D/hjx8EkU5MHcag7qe6ik2J4\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 3247,
		"path": "../public/assets/SearchDropdown-Do3lMs5A.js"
	},
	"/assets/SipSheet-CcBIriAM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e88-kfSw0ggP/jkkGccPuhhIE79xsUI\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 3720,
		"path": "../public/assets/SipSheet-CcBIriAM.js"
	},
	"/assets/SpendDonut-BpzetKhk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"84c-VbC3cMKab57awqFF8Tdfo7hX2ug\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 2124,
		"path": "../public/assets/SpendDonut-BpzetKhk.js"
	},
	"/assets/YAxis-5m3zJOPL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ef3-5EcAptFpuPNcV3E+b5w3oJ93MMA\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 24307,
		"path": "../public/assets/YAxis-5m3zJOPL.js"
	},
	"/assets/accounts-ClAyh3w9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33f9-Mx7LT1xAeTEe07QI2HobLDhyN6k\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 13305,
		"path": "../public/assets/accounts-ClAyh3w9.js"
	},
	"/assets/arrow-down-BEzPg5v9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-+z71F/axHp8uYSAv5AUo4EUtf1c\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 165,
		"path": "../public/assets/arrow-down-BEzPg5v9.js"
	},
	"/assets/arrow-left-Bdt1PfM_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-OAnL6QD7AT9vzcxaMUWPl0904U0\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 165,
		"path": "../public/assets/arrow-left-Bdt1PfM_.js"
	},
	"/assets/arrow-up-right-gWBRGWxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-wFip/GHrWcyIBTiffHIdMAM42Wk\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 167,
		"path": "../public/assets/arrow-up-right-gWBRGWxE.js"
	},
	"/assets/auth.callback-DMtws7-g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6fa-8wST32WPSglQbQMi/Qx1iO1rgK0\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 1786,
		"path": "../public/assets/auth.callback-DMtws7-g.js"
	},
	"/assets/badge-GImrkLlP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"326-ZbDHUwIrEPw46VrC1QGQtcZxh2g\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 806,
		"path": "../public/assets/badge-GImrkLlP.js"
	},
	"/assets/bell-ring-DujvV8jH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18d-dWITHsCnpq0S6SlJ414NLiEELrc\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 397,
		"path": "../public/assets/bell-ring-DujvV8jH.js"
	},
	"/assets/bills-BnuCkLlU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2262-hv6NSMkY8v0phuppLOHwJIGXxV4\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 8802,
		"path": "../public/assets/bills-BnuCkLlU.js"
	},
	"/assets/bot-mZlhzHVu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-o3cWrdsAW+Ccx+WpSSBGLHYn0m8\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 328,
		"path": "../public/assets/bot-mZlhzHVu.js"
	},
	"/assets/budgets-RNYuy2ma.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21a9-YiaWU7jIWyO4OLQBPIerQdxvP5w\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 8617,
		"path": "../public/assets/budgets-RNYuy2ma.js"
	},
	"/assets/calculator-Bqh42_l1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"212-24Iea6CnZ4uF+OZKSKroKfDFiqk\"",
		"mtime": "2026-10-03T11:25:43.196Z",
		"size": 530,
		"path": "../public/assets/calculator-Bqh42_l1.js"
	},
	"/assets/calendar-clock-DfG-hU0Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17a-EsnLwnINblmgUxwPNM6rat5WGwM\"",
		"mtime": "2026-10-03T11:25:43.199Z",
		"size": 378,
		"path": "../public/assets/calendar-clock-DfG-hU0Q.js"
	},
	"/assets/camera-BFX8ak5t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"150-jnnGn7L6WZzU4RMYEAaksbl0/dQ\"",
		"mtime": "2026-10-03T11:25:43.202Z",
		"size": 336,
		"path": "../public/assets/camera-BFX8ak5t.js"
	},
	"/assets/card-DBekvKeh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41c-kbZSxjuZyV4DrKb2cQ++qBY9XC8\"",
		"mtime": "2026-10-03T11:25:43.202Z",
		"size": 1052,
		"path": "../public/assets/card-DBekvKeh.js"
	},
	"/assets/categories-ChX891oT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3efa-K+fsqbzbxX/sMzC16WMvRhTINSQ\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 16122,
		"path": "../public/assets/categories-ChX891oT.js"
	},
	"/assets/chat-BhLfUE6B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f93-yQRRj+wmic0Xt0MpIuyYUGehHVA\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 8083,
		"path": "../public/assets/chat-BhLfUE6B.js"
	},
	"/assets/chevron-down-DxUrtHFo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-9tDrPPn2hFXe7PLqeq7t5jix8bo\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 128,
		"path": "../public/assets/chevron-down-DxUrtHFo.js"
	},
	"/assets/chevron-left-BqXVpTN8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82-XOUl7uE3BQcYvsK7y8Bqx2h6hM0\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 130,
		"path": "../public/assets/chevron-left-BqXVpTN8.js"
	},
	"/assets/circle-check-DjOsU-2G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-mxVeUOMAM7J+cYmJuSZXlZLGF30\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 178,
		"path": "../public/assets/circle-check-DjOsU-2G.js"
	},
	"/assets/clsx-CjueKrWZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-hIN6XMVOMUzluNGmYPaM/SbauwQ\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 368,
		"path": "../public/assets/clsx-CjueKrWZ.js"
	},
	"/assets/createClientRpc-CKl5TyNe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81f4-0/0T4G/ID4PytM74lNmmnHUPTRg\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 33268,
		"path": "../public/assets/createClientRpc-CKl5TyNe.js"
	},
	"/assets/createLucideIcon-CLdWFMku.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab-rMBxsqcPKrcnF/JzamLtMRV6aPw\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 1195,
		"path": "../public/assets/createLucideIcon-CLdWFMku.js"
	},
	"/assets/credit-card-CB39ehyq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-KR+OyZZ3qvgkwNtWyQuud2yJC6M\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 207,
		"path": "../public/assets/credit-card-CB39ehyq.js"
	},
	"/assets/data-CdtQUS-k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"120a-YsRTRA6tPrEzW6J9ufnB4vUTB/I\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 4618,
		"path": "../public/assets/data-CdtQUS-k.js"
	},
	"/assets/dialog-DnSlfr7s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"844-hq+gDeq0oUy490M1xMLxOqkOIfE\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 2116,
		"path": "../public/assets/dialog-DnSlfr7s.js"
	},
	"/assets/dist-BaL6Usns.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157a-pao3dgKWiBVPQhN1ROe4ensIkT4\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 5498,
		"path": "../public/assets/dist-BaL6Usns.js"
	},
	"/assets/dist-DonatgXG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3c-rhiqsGaGDKNDHG2sYHoj65wvrHk\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 2876,
		"path": "../public/assets/dist-DonatgXG.js"
	},
	"/assets/dist-R6l0rNmG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15b-27z/H7mWky/IbMxS//nCcaxhMc4\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 347,
		"path": "../public/assets/dist-R6l0rNmG.js"
	},
	"/assets/dist-SZfiYarR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16c3-rSuIhDXVb87yoKweZNDNz+wqUeE\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 5827,
		"path": "../public/assets/dist-SZfiYarR.js"
	},
	"/assets/download-CV6x-mg2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e8-kAup+r+nhyupqoE4RponPE902CU\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 232,
		"path": "../public/assets/download-CV6x-mg2.js"
	},
	"/assets/es2015-DBhBgIR6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5571-mFu9mc1WfbOz2xCwj2SVuKcjCNc\"",
		"mtime": "2026-10-03T11:25:43.204Z",
		"size": 21873,
		"path": "../public/assets/es2015-DBhBgIR6.js"
	},
	"/assets/expenses-BOH5yYbH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c75b-7nkVqYACRastAxgGFzCwT+zIskE\"",
		"mtime": "2026-10-03T11:25:43.205Z",
		"size": 51035,
		"path": "../public/assets/expenses-BOH5yYbH.js"
	},
	"/assets/eye-Cbs9C6DS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"100-XZbF7E1t9SnCMeEKvAQ4lWCbIvw\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 256,
		"path": "../public/assets/eye-Cbs9C6DS.js"
	},
	"/assets/eye-off-DIe2-cve.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ae-DEc4l0W/oWuSXoEchiwex0AfHBk\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 430,
		"path": "../public/assets/eye-off-DIe2-cve.js"
	},
	"/assets/format-BIW7y3xe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d7-FivgpRaeHg7hq7S57uWPffipAQ0\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 983,
		"path": "../public/assets/format-BIW7y3xe.js"
	},
	"/assets/generateCategoricalChart-XQk3D7w-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"546d6-5SrKrjt3Mn1Wog/kOudjam+Uzwo\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 345814,
		"path": "../public/assets/generateCategoricalChart-XQk3D7w-.js"
	},
	"/assets/goals-BQcoonXf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c85-2JWsxcwyAbpLiHyXneHbyV8ljpM\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 11397,
		"path": "../public/assets/goals-BQcoonXf.js"
	},
	"/assets/history-qHdDmXRD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5e5-DXCkXobecZKy2A1mdRvT3N3mGv0\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 1509,
		"path": "../public/assets/history-qHdDmXRD.js"
	},
	"/assets/hooks-DmcIzQwM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138a-yCFGaYnHBWohfS6uvelbCvdG7RM\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 5002,
		"path": "../public/assets/hooks-DmcIzQwM.js"
	},
	"/assets/index-DFqYywzz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71943-n3/+U0NpZWg3nRvvYV+LScQ7hmA\"",
		"mtime": "2026-10-03T11:25:43.184Z",
		"size": 465219,
		"path": "../public/assets/index-DFqYywzz.js"
	},
	"/assets/input-co1xigF9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d-LOampc3a6hfotwrlbV6P5StPwmA\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 621,
		"path": "../public/assets/input-co1xigF9.js"
	},
	"/assets/insights-yHFzlwX0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50b1-N9/upHUSy8kuQPrcPBA9fjGhDHk\"",
		"mtime": "2026-10-03T11:25:43.207Z",
		"size": 20657,
		"path": "../public/assets/insights-yHFzlwX0.js"
	},
	"/assets/invariant-CgFvOqN2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c2-OtvVxjJzKVqOT1XQL6Tnz3B8fGk\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 450,
		"path": "../public/assets/invariant-CgFvOqN2.js"
	},
	"/assets/investments-cY7rc8sQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e5-cp7oB7QK4oo8tV8clHSFVdO4lk8\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 485,
		"path": "../public/assets/investments-cY7rc8sQ.js"
	},
	"/assets/jsx-runtime-B-hcVAMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216d-pcqlp1Bv4Kt7yFmWJlJC8xMXx/k\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 8557,
		"path": "../public/assets/jsx-runtime-B-hcVAMW.js"
	},
	"/assets/label-lwC5zjUP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cf-W/rWDN1X9+DWqmGR+EI0a8Q0DhU\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 719,
		"path": "../public/assets/label-lwC5zjUP.js"
	},
	"/assets/lightbulb-B4w5VfBQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b0-XHccEhpCFa6sMusr6Fd+TnuaJoQ\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 432,
		"path": "../public/assets/lightbulb-B4w5VfBQ.js"
	},
	"/assets/link-Csno6YYW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c05-69ZpA8fb9+22F47Pbm3c7uQNp4g\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 11269,
		"path": "../public/assets/link-Csno6YYW.js"
	},
	"/assets/loader-circle-NEOay2w5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90-EwxFegbzh0ZbZxF5+7pxmz/q38Q\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 144,
		"path": "../public/assets/loader-circle-NEOay2w5.js"
	},
	"/assets/login-B40kEaKm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18c8-eFkXBUNbBqI4qZGjhkHl9L2lpU4\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 6344,
		"path": "../public/assets/login-B40kEaKm.js"
	},
	"/assets/money-_7MmrXZN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75-ahXKroHKoRK5sArDQNxopT01/bI\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 117,
		"path": "../public/assets/money-_7MmrXZN.js"
	},
	"/assets/more-K9EQHWvb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1075-/Y8b25sXP+KQH7Gep+2zzwmghvo\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 4213,
		"path": "../public/assets/more-K9EQHWvb.js"
	},
	"/assets/notifications-CBD55VBd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113d-9kFolE9lMTrcpjFMkOs1BuaT0Qg\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 4413,
		"path": "../public/assets/notifications-CBD55VBd.js"
	},
	"/assets/onboarding-BRrsGYM_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ed0-e7pPjoJqA29KTtEdfmNyOSFoDME\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 11984,
		"path": "../public/assets/onboarding-BRrsGYM_.js"
	},
	"/assets/payment-contacts-BY_I5gaU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"83cd-PCLvNFwYIV2R1vbQsTuz8xXCTNw\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 33741,
		"path": "../public/assets/payment-contacts-BY_I5gaU.js"
	},
	"/assets/payments-DQg8kh3_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1267a-uMmGN9MVr5d8Sh0A9LOOkwA62+A\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 75386,
		"path": "../public/assets/payments-DQg8kh3_.js"
	},
	"/assets/pencil-CFgylVBP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"114-lUYaUwF/8kuolP1xll6H4TjiaNM\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 276,
		"path": "../public/assets/pencil-CFgylVBP.js"
	},
	"/assets/play-B3lrLyfe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15c-cPV7HXlrJCe+ASSqXNECIweQnn4\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 348,
		"path": "../public/assets/play-B3lrLyfe.js"
	},
	"/assets/plus-qKI-KwZh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-fL7pyUOcaBb8DfLnjqQYwhLtQHU\"",
		"mtime": "2026-10-03T11:25:43.208Z",
		"size": 153,
		"path": "../public/assets/plus-qKI-KwZh.js"
	},
	"/assets/portfolio-byhPAFaL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"614a-bN8eg4WuTMQ8SsOKoVV9dQa+0yA\"",
		"mtime": "2026-10-03T11:25:43.209Z",
		"size": 24906,
		"path": "../public/assets/portfolio-byhPAFaL.js"
	},
	"/assets/portfolio-math-BfN2JuzZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"957-oCxLejVfFMXTouqbVyBc5iOlYaU\"",
		"mtime": "2026-10-03T11:25:43.210Z",
		"size": 2391,
		"path": "../public/assets/portfolio-math-BfN2JuzZ.js"
	},
	"/assets/profile-TkfeoPN2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1759-hx1nfb975R8L35yPrwaF0UP5Lbs\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 5977,
		"path": "../public/assets/profile-TkfeoPN2.js"
	},
	"/assets/progress-ChY0D8ry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8cb-JDujxOVokxyNzfDyao3LN0rYUsE\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 2251,
		"path": "../public/assets/progress-ChY0D8ry.js"
	},
	"/assets/query-0rShAPzg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15f5-CebLrIPklhob+6ng4Vrzqi8Tchw\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 5621,
		"path": "../public/assets/query-0rShAPzg.js"
	},
	"/assets/readiness-Bb65YxlE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d92-sCurPx3HQEILfRG7lwjNM+nHfII\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 11666,
		"path": "../public/assets/readiness-Bb65YxlE.js"
	},
	"/assets/refresh-cw-CHzni4H4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"141-Vf2GDKIMm2e+scRn8WtuFDjH5yE\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 321,
		"path": "../public/assets/refresh-cw-CHzni4H4.js"
	},
	"/assets/routes-B26mPRj0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a990-cqUTDH46wvrhqCJ51dksbx3Krc8\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 43408,
		"path": "../public/assets/routes-B26mPRj0.js"
	},
	"/assets/screener-DZVoKAe-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ccb-wST2glNmYpIK+ooI0VfEJf/kiCY\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 7371,
		"path": "../public/assets/screener-DZVoKAe-.js"
	},
	"/assets/select-k06Mohg0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5812-1yhW+qNNz+qScZvyX3OdYnQTKFw\"",
		"mtime": "2026-10-03T11:25:43.212Z",
		"size": 22546,
		"path": "../public/assets/select-k06Mohg0.js"
	},
	"/assets/settings-K990jmEJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5950-dNBvScTisYWCc3UVZ5lE/rhfHVA\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 22864,
		"path": "../public/assets/settings-K990jmEJ.js"
	},
	"/assets/shared-e7CCF49j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f9-09iPr3id1KJzmGnxA6muJ8r1kwM\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 1017,
		"path": "../public/assets/shared-e7CCF49j.js"
	},
	"/assets/shield-check-DFHzr1Zc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-eDBcw3yCumKkKJKPHpRBYc9MDPU\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 320,
		"path": "../public/assets/shield-check-DFHzr1Zc.js"
	},
	"/assets/skeleton-C7fBti2O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-n9UnmtH3O0JCp4R8S/YnUC6F1JQ\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 254,
		"path": "../public/assets/skeleton-C7fBti2O.js"
	},
	"/assets/slider-B0yy1ew6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2804-qZzOqPCLThaXjlF0oBjEPUoFYCM\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 10244,
		"path": "../public/assets/slider-B0yy1ew6.js"
	},
	"/assets/star-uDEKZL9z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d8-mPWg1wRYGouAhcCmrvdFQA6hVk4\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 472,
		"path": "../public/assets/star-uDEKZL9z.js"
	},
	"/assets/stocks._symbol-DQsW7ubx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6824-wtSQIPuzBjIMmOUmkYg5RfBj178\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 26660,
		"path": "../public/assets/stocks._symbol-DQsW7ubx.js"
	},
	"/assets/styles-CYWcoZsx.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17757-0pWiSyuthdc59sDqfRbawa0XDeM\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 96087,
		"path": "../public/assets/styles-CYWcoZsx.css"
	},
	"/assets/supabase-iDE6XVBn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"38653-vA2pqXmcWVB71gPVJ5JST9Nr8O4\"",
		"mtime": "2026-10-03T11:25:43.213Z",
		"size": 230995,
		"path": "../public/assets/supabase-iDE6XVBn.js"
	},
	"/assets/switch-DRVGbLJI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10fb-V1ZsNi+WVH+OP8w+AuvPN/iAX0k\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 4347,
		"path": "../public/assets/switch-DRVGbLJI.js"
	},
	"/assets/table-CVTH3kAx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66c-56E89BfhQMvGKS8gWB+dOTJglk0\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 1644,
		"path": "../public/assets/table-CVTH3kAx.js"
	},
	"/assets/tabs-CtGGrLuc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"de0-//iHMBmqiHUaSTtj3ypskIxR+JE\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 3552,
		"path": "../public/assets/tabs-CtGGrLuc.js"
	},
	"/assets/tools-BZSI5N7S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dcf1-Up+PyBSpN88pQ44DHmfdA74Tvvw\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 56561,
		"path": "../public/assets/tools-BZSI5N7S.js"
	},
	"/assets/trash-2-D9HI9O7Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-sFEpw+eOhjMQpJNeJYC0CWU/AqM\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 328,
		"path": "../public/assets/trash-2-D9HI9O7Q.js"
	},
	"/assets/triangle-alert-DvOHJyPM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"109-7NIRDMPbe5fmF1uzuG8T+CYG4ig\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 265,
		"path": "../public/assets/triangle-alert-DvOHJyPM.js"
	},
	"/assets/useQuery-BkQOt7WM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cee-+JPTHf5Jamef0ci8mwpQAGUaJdo\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 23790,
		"path": "../public/assets/useQuery-BkQOt7WM.js"
	},
	"/assets/useRouter-BGpAXxmD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-+ISDMDd0jCDVZNcQqLKhSYvsP+8\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 151,
		"path": "../public/assets/useRouter-BGpAXxmD.js"
	},
	"/assets/useWatchlist-BCqvG-w6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e8-RArZ2R30dJSeCCklXHktqV5/VeU\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 744,
		"path": "../public/assets/useWatchlist-BCqvG-w6.js"
	},
	"/assets/utils-CyS44Rj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a17-sWe4awICgqm+O3vGqB6VZWpbA3c\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 27159,
		"path": "../public/assets/utils-CyS44Rj3.js"
	},
	"/assets/utils-DpnuqbQE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6bf-PTfd17FkJv73oOH5+pJCJ1vIQSA\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 1727,
		"path": "../public/assets/utils-DpnuqbQE.js"
	},
	"/assets/wallet-cards-C4OO0Vcp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-2UjHTTVZQTVSoM1d1wTdsX+HEVU\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 328,
		"path": "../public/assets/wallet-cards-C4OO0Vcp.js"
	},
	"/assets/watchlist-Zc_eIKR7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2699-ESfT0KfYBDN3QhZkeos8WamEJv4\"",
		"mtime": "2026-10-03T11:25:43.214Z",
		"size": 9881,
		"path": "../public/assets/watchlist-Zc_eIKR7.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_xnNa_d = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_xnNa_d
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
