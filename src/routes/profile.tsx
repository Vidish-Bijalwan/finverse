import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { avatarInitials } from "@/lib/names";
import { isValidMobileNumber } from "@/lib/payment-contacts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pressable } from "@/components/fv";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FinVerse AI" },
      { name: "description", content: "Manage your FinVerse AI profile." },
    ],
  }),
  component: ProfilePage,
});

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** Avatar initials via the shared rule (`@/lib/names`): first letters of the
 * first two words, uppercased — "QA Test Beneficiary" -> "QT". */
function initialsOf(name: string | null, email: string | undefined): string {
  const src = (name ?? "").trim() || (email ?? "").trim();
  return avatarInitials(src || null);
}

function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fill the form once the profile row arrives.
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setBio(profile?.bio ?? "");
    setPhone(profile?.phone ?? "");
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div
          className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none"
          role="status"
          aria-label="Loading profile"
        />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;

  // Narrowed: safe to capture for the async handlers below.
  const userId = user.id;
  const initials = initialsOf(profile?.full_name ?? null, user.email);

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("The photo must be under 5 MB.");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar.${ext}`;

    setUploading(true);
    try {
      const supabase = getSupabase();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-buster so the new photo shows immediately.
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = getSupabase();
      const phoneTrimmed = phone.trim();
      if (phoneTrimmed !== "" && !isValidMobileNumber(phoneTrimmed)) {
        toast.error("Enter a valid 10-digit Indian mobile number (starting with 6–9).");
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          phone: phoneTrimmed || null,
        })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">How you appear in FinVerse AI.</p>

      {/* Avatar */}
      <div className="mt-8 flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Change profile photo"
          disabled={uploading}
          className={`group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-primary ${pressable}`}
        >
          <Avatar className="size-24">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || "Profile photo"} />}
            <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
            <Camera className="size-6 text-white" />
          </span>
          {uploading && (
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/45">
              <span className="size-6 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
            </span>
          )}
        </button>
        <div>
          <p className="text-base font-bold text-foreground">{fullName || "Your name"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`mt-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 ${pressable}`}
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFile}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Details */}
      <div className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-bio">Bio</Label>
          <Textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A line about you and your money goals"
            rows={3}
            maxLength={280}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email ?? ""} readOnly disabled />
        </div>
        <p className="text-xs text-muted-foreground">
          Member since {formatMemberSince(user.created_at)}
        </p>
      </div>

      <Button
        className={`mt-6 w-full ${pressable}`}
        onClick={handleSave}
        disabled={saving || uploading}
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>

      <Button
        variant="outline"
        className={`mt-3 w-full text-destructive hover:text-destructive ${pressable}`}
        onClick={handleLogout}
      >
        <LogOut className="size-4" /> Log out
      </Button>
    </div>
  );
}
