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
		"mtime": "2026-10-02T20:08:54.118Z",
		"size": 469,
		"path": "../public/favicon.svg"
	},
	"/assets/AnimatedProgress-uAYwBBoU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245-m4qpI8NwfxLE3/JWyA6KD8/vZFk\"",
		"mtime": "2026-10-02T20:08:51.636Z",
		"size": 581,
		"path": "../public/assets/AnimatedProgress-uAYwBBoU.js"
	},
	"/assets/AppHeader-CRz926st.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b8d-oyPslOTRIfQml8zW9KYmfatvPGA\"",
		"mtime": "2026-10-02T20:08:51.636Z",
		"size": 31629,
		"path": "../public/assets/AppHeader-CRz926st.js"
	},
	"/assets/AreaChart-DR9nzCcj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"893b-Gk8w0+SeftKWlEdA/dstA1uq6GU\"",
		"mtime": "2026-10-02T20:08:51.637Z",
		"size": 35131,
		"path": "../public/assets/AreaChart-DR9nzCcj.js"
	},
	"/assets/CategorySelect-DjW4lbHe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"310-zr/ax/nkaAFMjRrfGWKTbHb3nJw\"",
		"mtime": "2026-10-02T20:08:51.638Z",
		"size": 784,
		"path": "../public/assets/CategorySelect-DjW4lbHe.js"
	},
	"/assets/Combination-sQcNwk8z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6e14-BSuet5hY27nLZJ6Y4JeGVmECGUg\"",
		"mtime": "2026-10-02T20:08:51.638Z",
		"size": 28180,
		"path": "../public/assets/Combination-sQcNwk8z.js"
	},
	"/assets/ConfirmDeleteDialog-BlGmUQth.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"265-aKFV2SlbxXA4i04y+N/pKCRXrs0\"",
		"mtime": "2026-10-02T20:08:51.638Z",
		"size": 613,
		"path": "../public/assets/ConfirmDeleteDialog-BlGmUQth.js"
	},
	"/assets/HoldingDialog-BynzuFF9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d92-Kyaty22J+kdnQTi/lh6/muh4o4s\"",
		"mtime": "2026-10-02T20:08:51.638Z",
		"size": 3474,
		"path": "../public/assets/HoldingDialog-BynzuFF9.js"
	},
	"/assets/PageShell-BQgi3-P1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d0-Eu2C4Twvzlohi2hsDtVSvtXi4W8\"",
		"mtime": "2026-10-02T20:08:51.639Z",
		"size": 720,
		"path": "../public/assets/PageShell-BQgi3-P1.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-10-02T20:08:54.118Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/PieChart-BGYj0we5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a4-m6jbuwHzOcLewRToDS8T85df+hU\"",
		"mtime": "2026-10-02T20:08:51.639Z",
		"size": 25764,
		"path": "../public/assets/PieChart-BGYj0we5.js"
	},
	"/assets/accounts-DxQsuzRH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45c2-m4En5UKGX67ZvQ4q21bzP9+IY8I\"",
		"mtime": "2026-10-02T20:08:51.639Z",
		"size": 17858,
		"path": "../public/assets/accounts-DxQsuzRH.js"
	},
	"/assets/alert-dialog-DvJ79aMK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e4d-x5FwVrQFfXiII/fqp8yDmuGP8kQ\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 3661,
		"path": "../public/assets/alert-dialog-DvJ79aMK.js"
	},
	"/assets/arrow-up-right-DbMo_z3u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-wCX6qoTsGhjDXIIkAM7kvzXYMr0\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 271,
		"path": "../public/assets/arrow-up-right-DbMo_z3u.js"
	},
	"/assets/badge-DXq3Jy87.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2fe-2E+5hWcXbREgZBTReFMKBFIOXYk\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 766,
		"path": "../public/assets/badge-DXq3Jy87.js"
	},
	"/assets/bell-ring-BnNna9FE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-1QwNiBOMeETjhY4u6KVd3gIixEA\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 385,
		"path": "../public/assets/bell-ring-BnNna9FE.js"
	},
	"/assets/bills-B7iK50YI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22d4-NFHKIometk3LzBJW8EPK1e4jLEg\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 8916,
		"path": "../public/assets/bills-B7iK50YI.js"
	},
	"/assets/bot-ZuKZpRdp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-nCTf2ez1BRDqUEwxmIK1aG0CRlM\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 316,
		"path": "../public/assets/bot-ZuKZpRdp.js"
	},
	"/assets/budgets-Cfic0BHY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20bf-5mCVSycPPqz83ZV+lcoIFPLblD0\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 8383,
		"path": "../public/assets/budgets-Cfic0BHY.js"
	},
	"/assets/calculator-Bx0Qovm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"206-VlrI8I8x7c2vouT97mUf6kBjGiA\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 518,
		"path": "../public/assets/calculator-Bx0Qovm7.js"
	},
	"/assets/calendar-clock-Bf8e9djJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e-uJKPTPtKpQmhm3mm1mUy0HzJZr4\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 366,
		"path": "../public/assets/calendar-clock-Bf8e9djJ.js"
	},
	"/assets/button-DfPVG06s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"604-G+efAQOSl1BXYWPsMxPEE/M2viM\"",
		"mtime": "2026-10-02T20:08:51.640Z",
		"size": 1540,
		"path": "../public/assets/button-DfPVG06s.js"
	},
	"/assets/card-2tU4t9Y2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f4-+s7PTkZW3o/GVUNix6GY16QcZis\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 1012,
		"path": "../public/assets/card-2tU4t9Y2.js"
	},
	"/assets/categories-Du5Tn9ZD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4050-q4tWrbNy9DgcuG/yX2UHv1rrrJc\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 16464,
		"path": "../public/assets/categories-Du5Tn9ZD.js"
	},
	"/assets/chart-no-axes-combined-CF_3iWJz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-QktHr15+ipvnzox4esxvYjpnsuk\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 368,
		"path": "../public/assets/chart-no-axes-combined-CF_3iWJz.js"
	},
	"/assets/chat-BJfuwB93.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb0-cWkD6pBbhOUalXUDCstw0vPs0SE\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 7856,
		"path": "../public/assets/chat-BJfuwB93.js"
	},
	"/assets/chevron-down-CRlamhA8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74-X/688m3X6oJYOQI8DZhiKcQmnEw\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 116,
		"path": "../public/assets/chevron-down-CRlamhA8.js"
	},
	"/assets/chevron-left-B5ZN_qdI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"76-f9NNy/Err9tnBVQnLGXHW2jMrz4\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 118,
		"path": "../public/assets/chevron-left-B5ZN_qdI.js"
	},
	"/assets/chevron-right-CIuY1i22.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"76-+rwgh5EZn8+GBx7bEYz9pp4RZSQ\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 118,
		"path": "../public/assets/chevron-right-CIuY1i22.js"
	},
	"/assets/circle-check-D5EM2TiE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a6-cLWQh8WECrHiMtvw/WZAhKxDrNg\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 166,
		"path": "../public/assets/circle-check-D5EM2TiE.js"
	},
	"/assets/data-CdtQUS-k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"120a-YsRTRA6tPrEzW6J9ufnB4vUTB/I\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 4618,
		"path": "../public/assets/data-CdtQUS-k.js"
	},
	"/assets/dialog-B2eEji8m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82a-42R/qmGe7fG59g045Wv/8Xk5co4\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 2090,
		"path": "../public/assets/dialog-B2eEji8m.js"
	},
	"/assets/dist-B34a6bIO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a066-qvQ6tXIeGDjFvf/9Rofg0sLJ+8Y\"",
		"mtime": "2026-10-02T20:08:51.641Z",
		"size": 41062,
		"path": "../public/assets/dist-B34a6bIO.js"
	},
	"/assets/dist-CBqIOMf42.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"104f-pK4gO3oAqg50rtzxuImmokP7Ib0\"",
		"mtime": "2026-10-02T20:08:51.642Z",
		"size": 4175,
		"path": "../public/assets/dist-CBqIOMf42.js"
	},
	"/assets/dist-DR9phurB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7f30-luud5lhiX8ifiwEWq9jztOJOiBQ\"",
		"mtime": "2026-10-02T20:08:51.644Z",
		"size": 32560,
		"path": "../public/assets/dist-DR9phurB.js"
	},
	"/assets/dist-DZTnjL1b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"129b-+zVpZriFmZXIWlfkrheCRizqZCM\"",
		"mtime": "2026-10-02T20:08:51.644Z",
		"size": 4763,
		"path": "../public/assets/dist-DZTnjL1b.js"
	},
	"/assets/dist-DlB-0-Uh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"823e-ypGh1JRyhSB63LOt7uqpF47h/lo\"",
		"mtime": "2026-10-02T20:08:51.645Z",
		"size": 33342,
		"path": "../public/assets/dist-DlB-0-Uh.js"
	},
	"/assets/dist-VXloUxUo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"169c-5lTje+hKScZg5urOKEZLiapqAPU\"",
		"mtime": "2026-10-02T20:08:51.645Z",
		"size": 5788,
		"path": "../public/assets/dist-VXloUxUo.js"
	},
	"/assets/download-CXWfolcE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dc-zTDQDalDMaKZFkzX5183oR5bKJY\"",
		"mtime": "2026-10-02T20:08:51.646Z",
		"size": 220,
		"path": "../public/assets/download-CXWfolcE.js"
	},
	"/assets/engine-DleVxnQa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3d68-zt/lF3ScZAWMiIHxMinN5DeOt0g\"",
		"mtime": "2026-10-02T20:08:51.646Z",
		"size": 15720,
		"path": "../public/assets/engine-DleVxnQa.js"
	},
	"/assets/expenses-C7ych1mZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf80-hqs+/3ZrbTkuXHwcJ4skDjKIzGA\"",
		"mtime": "2026-10-02T20:08:51.646Z",
		"size": 53120,
		"path": "../public/assets/expenses-C7ych1mZ.js"
	},
	"/assets/eye-CcGirbuC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-Hzue/YVYBNNsM3Q+Axc3RdeaHkg\"",
		"mtime": "2026-10-02T20:08:51.647Z",
		"size": 244,
		"path": "../public/assets/eye-CcGirbuC.js"
	},
	"/assets/flame-l-GG3xBZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-SYKzoW9KKn31X220CkpefgL0tXo\"",
		"mtime": "2026-10-02T20:08:51.647Z",
		"size": 187,
		"path": "../public/assets/flame-l-GG3xBZ.js"
	},
	"/assets/generateCategoricalChart-B_cCEvtg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"546b5-ChJ2QQEAye9CyOvBO3fDBUWHgls\"",
		"mtime": "2026-10-02T20:08:51.648Z",
		"size": 345781,
		"path": "../public/assets/generateCategoricalChart-B_cCEvtg.js"
	},
	"/assets/goals-BbHyMndR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b8b-7aqgZhDpZ0nN2RrDJTzr7jmymq8\"",
		"mtime": "2026-10-02T20:08:51.649Z",
		"size": 11147,
		"path": "../public/assets/goals-BbHyMndR.js"
	},
	"/assets/history-BjlupdB5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"506-R/XLOT0su2A/ENC1kISgCHCkVco\"",
		"mtime": "2026-10-02T20:08:51.650Z",
		"size": 1286,
		"path": "../public/assets/history-BjlupdB5.js"
	},
	"/assets/hooks-CAk7UNv7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"174b-S/jEHm1NZH0o+AAswEO30t2Zods\"",
		"mtime": "2026-10-02T20:08:51.652Z",
		"size": 5963,
		"path": "../public/assets/hooks-CAk7UNv7.js"
	},
	"/assets/index-CNMVwmt-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab5f-8vtSYFsrqRBpO4j5YkhEEM0MY94\"",
		"mtime": "2026-10-02T20:08:51.634Z",
		"size": 306015,
		"path": "../public/assets/index-CNMVwmt-.js"
	},
	"/assets/input-BJNMl2Mk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"245-EqKxkYKO7qB/VAjKyDcBYiGhTNU\"",
		"mtime": "2026-10-02T20:08:51.652Z",
		"size": 581,
		"path": "../public/assets/input-BJNMl2Mk.js"
	},
	"/assets/insights-DEde4DuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f06-uJmeRQLOzo6aLoC9kzpHtjq6DUs\"",
		"mtime": "2026-10-02T20:08:51.653Z",
		"size": 20230,
		"path": "../public/assets/insights-DEde4DuE.js"
	},
	"/assets/label-Ch7TVFMB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7-OqSSexHFPeTO8/G4HuR90FrRQRU\"",
		"mtime": "2026-10-02T20:08:51.653Z",
		"size": 679,
		"path": "../public/assets/label-Ch7TVFMB.js"
	},
	"/assets/lightbulb-BP_mhUiY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112-yO49IX5Eq6W3uEmZPCD33kN9cLg\"",
		"mtime": "2026-10-02T20:08:51.653Z",
		"size": 274,
		"path": "../public/assets/lightbulb-BP_mhUiY.js"
	},
	"/assets/link-ByuqH-h_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bfe-jXcTXFyZA/olK1VcfdSpTiVWl/0\"",
		"mtime": "2026-10-02T20:08:51.653Z",
		"size": 11262,
		"path": "../public/assets/link-ByuqH-h_.js"
	},
	"/assets/money-Brhnsv7l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"547-aTuTjYrRW9WKTVIpu6g/jAQrpOk\"",
		"mtime": "2026-10-02T20:08:51.654Z",
		"size": 1351,
		"path": "../public/assets/money-Brhnsv7l.js"
	},
	"/assets/more-DKejB1wG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13dc-IwWdsErI8kCsHT5KYhd5FI6LunU\"",
		"mtime": "2026-10-02T20:08:51.654Z",
		"size": 5084,
		"path": "../public/assets/more-DKejB1wG.js"
	},
	"/assets/notifications-BNtENmXq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1118-V6BXvd6Jz1tJY2umH/eKbyeqqyk\"",
		"mtime": "2026-10-02T20:08:51.654Z",
		"size": 4376,
		"path": "../public/assets/notifications-BNtENmXq.js"
	},
	"/assets/notify-a63qkL6m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1197-2hAXUu+7FTUKzYPK/zoKRkKLwNM\"",
		"mtime": "2026-10-02T20:08:51.654Z",
		"size": 4503,
		"path": "../public/assets/notify-a63qkL6m.js"
	},
	"/assets/pencil-OQttd1AW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"108-uB7oliDwkisl8Ed200CQJ0EVpFc\"",
		"mtime": "2026-10-02T20:08:51.654Z",
		"size": 264,
		"path": "../public/assets/pencil-OQttd1AW.js"
	},
	"/assets/plus-Du470-LC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-dH6AiTNoLL4ww0GjiN3NLxgz0kQ\"",
		"mtime": "2026-10-02T20:08:51.655Z",
		"size": 141,
		"path": "../public/assets/plus-Du470-LC.js"
	},
	"/assets/portfolio-4r4P1c4t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"306c-c47oM3I8pydza5M2ZDLzXN38624\"",
		"mtime": "2026-10-02T20:08:51.655Z",
		"size": 12396,
		"path": "../public/assets/portfolio-4r4P1c4t.js"
	},
	"/assets/progress-B5vd13Jb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8a8-e2QCd5xGkvTFc14GTzUz03G2ceo\"",
		"mtime": "2026-10-02T20:08:51.655Z",
		"size": 2216,
		"path": "../public/assets/progress-B5vd13Jb.js"
	},
	"/assets/readiness-CPCXiG5r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d35-dFJzPjayhY4ImjnQDQDVGyjT7ug\"",
		"mtime": "2026-10-02T20:08:51.656Z",
		"size": 11573,
		"path": "../public/assets/readiness-CPCXiG5r.js"
	},
	"/assets/receipt-indian-rupee-DKbYyJk4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-uCzux3bVUEmSgzXTIu0Ours48X0\"",
		"mtime": "2026-10-02T20:08:51.656Z",
		"size": 312,
		"path": "../public/assets/receipt-indian-rupee-DKbYyJk4.js"
	},
	"/assets/receipt-text-B3TkqGpL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b-QEHh+1SMDoyKo8lSWo9nmsbCQUk\"",
		"mtime": "2026-10-02T20:08:51.656Z",
		"size": 651,
		"path": "../public/assets/receipt-text-B3TkqGpL.js"
	},
	"/assets/refresh-cw-pirSL0D_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-Pen5+WdPJ1wPBbn3XbTHptWrjZc\"",
		"mtime": "2026-10-02T20:08:51.656Z",
		"size": 309,
		"path": "../public/assets/refresh-cw-pirSL0D_.js"
	},
	"/assets/routes-BrnJEXVx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54e8-sOh0byefPnDD9SqnIsI7GDPLFbo\"",
		"mtime": "2026-10-02T20:08:51.657Z",
		"size": 21736,
		"path": "../public/assets/routes-BrnJEXVx.js"
	},
	"/assets/screener-DUlhQS5S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df1-bGezjhgFvEU6Kfx6QptoZWW6RcI\"",
		"mtime": "2026-10-02T20:08:51.657Z",
		"size": 7665,
		"path": "../public/assets/screener-DUlhQS5S.js"
	},
	"/assets/search-DHp875Jz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-FleUlNYb+wRQRlVWTaQC245WXdI\"",
		"mtime": "2026-10-02T20:08:51.658Z",
		"size": 162,
		"path": "../public/assets/search-DHp875Jz.js"
	},
	"/assets/select-BKMomikr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"575d-jX29TXXP/jYG/A6ZGE6/R6Q9cY4\"",
		"mtime": "2026-10-02T20:08:51.658Z",
		"size": 22365,
		"path": "../public/assets/select-BKMomikr.js"
	},
	"/assets/settings-7NxjAiIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"349d-6v2mK6/LEVshYyXFlIHDm3TnMqs\"",
		"mtime": "2026-10-02T20:08:51.658Z",
		"size": 13469,
		"path": "../public/assets/settings-7NxjAiIe.js"
	},
	"/assets/settings-CoUMYo6Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc0-z54p96ystpdH7DvvzekzzeOFlrA\"",
		"mtime": "2026-10-02T20:08:51.658Z",
		"size": 3264,
		"path": "../public/assets/settings-CoUMYo6Q.js"
	},
	"/assets/shared-CiCVUv5M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"699-I/nh5S4j39FFvQR0zqAT53+W320\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 1689,
		"path": "../public/assets/shared-CiCVUv5M.js"
	},
	"/assets/shield-check-DM3c_EJr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"134-7gyFHsZRulyy3p0t6TolAzXEyPA\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 308,
		"path": "../public/assets/shield-check-DM3c_EJr.js"
	},
	"/assets/skeleton-B0iWdhzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc-vpkrmXrQDoA+so4WC50Gouftfj4\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 188,
		"path": "../public/assets/skeleton-B0iWdhzm.js"
	},
	"/assets/slider-LqAiEOQ_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27c4-LwlhL6q2mXgwdcCFTDc88xrLlzQ\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 10180,
		"path": "../public/assets/slider-LqAiEOQ_.js"
	},
	"/assets/star-rlNmokh5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cc-aBmacfCEmmELMYBlPZTkJqsaJ5A\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 460,
		"path": "../public/assets/star-rlNmokh5.js"
	},
	"/assets/stocks._symbol-BmGk1RmD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3497-0pLQovUWyraYE30B9WGzk5NwLxY\"",
		"mtime": "2026-10-02T20:08:51.659Z",
		"size": 13463,
		"path": "../public/assets/stocks._symbol-BmGk1RmD.js"
	},
	"/assets/stocks._symbol-BtWvrotz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bd6-tvo+UUv8bmYtUjvoRPxqezGlc8c\"",
		"mtime": "2026-10-02T20:08:51.660Z",
		"size": 7126,
		"path": "../public/assets/stocks._symbol-BtWvrotz.js"
	},
	"/assets/store-v7hc0FLN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"545d-8ZC3R29Dh17eGZIDFtmUAVlyFkE\"",
		"mtime": "2026-10-02T20:08:51.660Z",
		"size": 21597,
		"path": "../public/assets/store-v7hc0FLN.js"
	},
	"/assets/styles-DQL4gm4F.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1a37f-Gs80Bp7kWd5ADOcPoHa76gAZz7Q\"",
		"mtime": "2026-10-02T20:08:51.665Z",
		"size": 107391,
		"path": "../public/assets/styles-DQL4gm4F.css"
	},
	"/assets/switch-D7YH-C5_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10bd-czULnllHv9yBFOssoUTe5kr3R0E\"",
		"mtime": "2026-10-02T20:08:51.660Z",
		"size": 4285,
		"path": "../public/assets/switch-D7YH-C5_.js"
	},
	"/assets/table-DxzDuNQz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"644-I3rScEBQJOyXc/wijHOYzvtMHy0\"",
		"mtime": "2026-10-02T20:08:51.661Z",
		"size": 1604,
		"path": "../public/assets/table-DxzDuNQz.js"
	},
	"/assets/target-B4X3To74.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d6-udoVZ6/WkKXHG2XSIq7HyXkSCxg\"",
		"mtime": "2026-10-02T20:08:51.661Z",
		"size": 214,
		"path": "../public/assets/target-B4X3To74.js"
	},
	"/assets/tools-CqZ370jm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e9b0-IaGnbEK7GDKFKpZW9WQqUizjX+E\"",
		"mtime": "2026-10-02T20:08:51.661Z",
		"size": 59824,
		"path": "../public/assets/tools-CqZ370jm.js"
	},
	"/assets/trash-2-DogNvtBE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-1oPhjEDnRgV6hNxieygZYNysho8\"",
		"mtime": "2026-10-02T20:08:51.662Z",
		"size": 316,
		"path": "../public/assets/trash-2-DogNvtBE.js"
	},
	"/assets/use-prefers-reduced-motion-DvbwGCwL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"142-X0ldjVrhOBTYWojcHR2OzlDrgFU\"",
		"mtime": "2026-10-02T20:08:51.662Z",
		"size": 322,
		"path": "../public/assets/use-prefers-reduced-motion-DvbwGCwL.js"
	},
	"/assets/useMutation-CKwsZJsO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15b2-b0/S+OMIULpif5SBAwM4RwmQ/QM\"",
		"mtime": "2026-10-02T20:08:51.662Z",
		"size": 5554,
		"path": "../public/assets/useMutation-CKwsZJsO.js"
	},
	"/assets/useNavigate-FUhEosJI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dd-U+1nruFvmYlh2Dnqe6Oj0+hMy2M\"",
		"mtime": "2026-10-02T20:08:51.663Z",
		"size": 221,
		"path": "../public/assets/useNavigate-FUhEosJI.js"
	},
	"/assets/useQuery-RzZEloou.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ce7-palM1BjbXskkK4xwiS2hw0MKzkg\"",
		"mtime": "2026-10-02T20:08:51.663Z",
		"size": 23783,
		"path": "../public/assets/useQuery-RzZEloou.js"
	},
	"/assets/useRouter-Bp5tBYIM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90-qps01rHXAa1/94EYJprpsPcBJdo\"",
		"mtime": "2026-10-02T20:08:51.663Z",
		"size": 144,
		"path": "../public/assets/useRouter-Bp5tBYIM.js"
	},
	"/assets/useWatchlist-Bj9x29qu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a3-dHUnpkEHArAQ2+OKw/ZhXf9b//c\"",
		"mtime": "2026-10-02T20:08:51.663Z",
		"size": 675,
		"path": "../public/assets/useWatchlist-Bj9x29qu.js"
	},
	"/assets/utils-DVpoLRi9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6b8-0hs0xn7eWKpSpkJhmQQFSejy2Fk\"",
		"mtime": "2026-10-02T20:08:51.664Z",
		"size": 1720,
		"path": "../public/assets/utils-DVpoLRi9.js"
	},
	"/assets/wallet-cards-ycCZkqTP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-sdKNlR09JIju8j3LXHbuyCwdHhA\"",
		"mtime": "2026-10-02T20:08:51.664Z",
		"size": 316,
		"path": "../public/assets/wallet-cards-ycCZkqTP.js"
	},
	"/assets/watchlist---3rdXNY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2375-6VB/gQfL9x3VONryEKRrogy5Wro\"",
		"mtime": "2026-10-02T20:08:51.664Z",
		"size": 9077,
		"path": "../public/assets/watchlist---3rdXNY.js"
	},
	"/assets/watchlist-BTiqFgXr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be5-N1mdKFEj4TIsCTcsQygoHzhhBJI\"",
		"mtime": "2026-10-02T20:08:51.665Z",
		"size": 3045,
		"path": "../public/assets/watchlist-BTiqFgXr.js"
	},
	"/assets/x-CZ48_d-b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-PZYdWzFGVAg038w4XbCt2fsEEFw\"",
		"mtime": "2026-10-02T20:08:51.665Z",
		"size": 142,
		"path": "../public/assets/x-CZ48_d-b.js"
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
var _lazy_HJcuIl = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_HJcuIl
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
