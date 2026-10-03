//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-B7-trGKW.js
var manifest = {
	"02c6def9966c47bdd505ba6ad74da24b480ffe8f8a969d31154dedc2f29a2142": {
		functionName: "getRazorpayStatusFn_createServerFn_handler",
		importer: () => import("./_ssr/razorpay.server-CVxih64f.mjs")
	},
	"5fdba5c9b2c2a46d87ce158b2cbb0afc81faff67cd4a1b7610dccff638f8f3db": {
		functionName: "createPaymentLinkFn_createServerFn_handler",
		importer: () => import("./_ssr/razorpay.server-CVxih64f.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
