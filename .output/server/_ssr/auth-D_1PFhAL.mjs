import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as getSupabase } from "./supabase-D8cuRV3S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-D_1PFhAL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(null);
/** Fetch the profiles row for `userId`, creating one if it doesn't exist. */
async function ensureProfile(userId, email) {
	const supabase = getSupabase();
	const { data: existing, error: readError } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	if (readError) throw new Error(readError.message || "Failed to load your profile.");
	if (existing) return existing;
	const { error: insertError } = await supabase.from("profiles").insert({
		id: userId,
		email: email ?? null
	});
	if (insertError) throw new Error(insertError.message || "Failed to create your profile.");
	const { data: created, error: rereadError } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	if (rereadError) throw new Error(rereadError.message || "Failed to load your profile.");
	return created ?? null;
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const mountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		let subscription = null;
		const resolveSession = async (currentUser) => {
			if (!mountedRef.current) return;
			if (currentUser) try {
				const p = await ensureProfile(currentUser.id, currentUser.email);
				if (!mountedRef.current) return;
				setUser(currentUser);
				setProfile(p);
			} catch (err) {
				console.error("Failed to resolve profile:", err);
				if (!mountedRef.current) return;
				setUser(currentUser);
				setProfile(null);
			}
			else {
				setUser(null);
				setProfile(null);
			}
			if (mountedRef.current) setLoading(false);
		};
		(async () => {
			try {
				const supabase = getSupabase();
				const { data: { session } } = await supabase.auth.getSession();
				await resolveSession(session?.user ?? null);
				const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
					if (event === "SIGNED_IN" || event === "SIGNED_OUT") setLoading(true);
					resolveSession(session?.user ?? null);
				});
				subscription = sub;
			} catch (err) {
				console.error("Failed to initialize auth:", err);
				if (mountedRef.current) {
					setUser(null);
					setProfile(null);
					setLoading(false);
				}
			}
		})();
		return () => {
			mountedRef.current = false;
			subscription?.unsubscribe();
		};
	}, []);
	const signUp = (0, import_react.useCallback)(async (email, password) => {
		const { error } = await getSupabase().auth.signUp({
			email,
			password
		});
		if (error) throw new Error(error.message || "Sign up failed. Please try again.");
	}, []);
	const signIn = (0, import_react.useCallback)(async (email, password) => {
		const { error } = await getSupabase().auth.signInWithPassword({
			email,
			password
		});
		if (error) throw new Error(error.message || "Sign in failed. Please try again.");
	}, []);
	const signInWithGoogle = (0, import_react.useCallback)(async () => {
		const { error } = await getSupabase().auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: window.location.origin + "/auth/callback" }
		});
		if (error) throw new Error(error.message || "Google sign in failed. Please try again.");
	}, []);
	const signOut = (0, import_react.useCallback)(async () => {
		const { error } = await getSupabase().auth.signOut();
		if (error) throw new Error(error.message || "Sign out failed. Please try again.");
		setUser(null);
		setProfile(null);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		profile,
		loading,
		signUp,
		signIn,
		signInWithGoogle,
		signOut
	}), [
		user,
		profile,
		loading,
		signUp,
		signIn,
		signInWithGoogle,
		signOut
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
	return ctx;
}
//#endregion
export { useAuth as n, AuthProvider as t };
