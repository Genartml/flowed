"use client";

import { useState, useEffect, useRef } from "react";
import { X, UserCircle, Check, Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface FounderProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialName: string;
  initialRole: string;
  initialBio: string;
  initialAvatar: string;
  onSave: (profile: {
    founderName: string;
    founderRole: string;
    founderBio: string;
    founderAvatar: string;
  }) => Promise<void>;
}

export function FounderProfileModal({
  open,
  onClose,
  initialName,
  initialRole,
  initialBio,
  initialAvatar,
  onSave,
}: FounderProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState(initialRole);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setRole(initialRole);
      setBio(initialBio);
      setAvatarUrl(initialAvatar);
      setSaved(false);
    }
  }, [open, initialName, initialRole, initialBio, initialAvatar]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload error:", data.error);
        alert(data.error || "Upload failed");
        return;
      }

      if (data.url) {
        setAvatarUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      founderName: name,
      founderRole: role,
      founderBio: bio,
      founderAvatar: avatarUrl,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Founder Profile</h2>
              <p className="text-xs text-zinc-500 font-medium">Personalize your AI cockpit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Avatar + Preview */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500 flex items-center justify-center shrink-0 overflow-hidden transition-all relative"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <UserCircle className="w-8 h-8 text-zinc-500" />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-100 truncate">{name || "Your Name"}</p>
              <p className="text-xs text-zinc-500 truncate">{role || "Founder & CEO"}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-1"
              >
                {uploading ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daksh Suthar"
              className="w-full h-11 px-4 text-sm border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-xl outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Your role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Founder & CEO, Solo Developer, Freelancer"
              className="w-full h-11 px-4 text-sm border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-xl outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">
              About you
              <span className="text-zinc-500 font-normal ml-1">(used by AI for personalized insights)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. I'm a solo founder building a SaaS product for restaurants. I'm bootstrapped, pre-revenue, and trying to hit $10k MRR in 6 months."
              className="w-full h-24 p-4 text-sm border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-xl resize-none outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
            />
            <p className="text-[11px] text-zinc-600 mt-1.5">
              The more context you give, the smarter your AI CFO becomes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={`w-full rounded-xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500 text-zinc-950"
                : "bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
