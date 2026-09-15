// frontend/src/components/LogoUpload.jsx
import React, { useState } from "react";
import API from "../api/axios";
import { Upload, Globe, Sparkles, Image as ImageIcon, X } from "lucide-react";

export default function LogoUpload({
  currentLogoUrl,
  onLogoChange,
  websiteDomain,
  onFileSelect,
}) {
  const [fetchingLogo, setFetchingLogo] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentLogoUrl || "");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    if (onFileSelect) onFileSelect(file);
    if (onLogoChange) onLogoChange(localUrl);
  };

  const handleAutoFetch = async () => {
    if (!websiteDomain) {
      setFetchError("Please enter a website or domain first (e.g. stripe.com)");
      return;
    }

    setFetchingLogo(true);
    setFetchError("");

    try {
      const res = await API.get(`/companies/lookup-logo?query=${encodeURIComponent(websiteDomain)}`);
      const fetchedUrl = res.data.logoUrl;
      setPreviewUrl(fetchedUrl);
      if (onLogoChange) onLogoChange(fetchedUrl);
    } catch (err) {
      setFetchError("Could not auto-fetch logo. You can upload an image file instead.");
    } finally {
      setFetchingLogo(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl("");
    if (onLogoChange) onLogoChange("");
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Company Logo (Cloudinary / Auto-Fetch)
      </label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
        {/* Logo Preview Box */}
        <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Logo preview"
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=Company&background=4f46e5&color=fff&size=128`;
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove logo"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="text-center p-2">
              <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">No Logo</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* File Upload Button */}
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 text-xs font-semibold rounded-lg shadow-xs hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              Upload Image
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Auto Fetch Button */}
            <button
              type="button"
              onClick={handleAutoFetch}
              disabled={fetchingLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              {fetchingLogo ? "Fetching..." : "⚡ Auto-Fetch by Domain"}
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Uploaded files stream directly to Cloudinary. Auto-fetch pulls brand logos from domain.
          </p>

          {fetchError && <p className="text-[11px] text-amber-600 font-medium">{fetchError}</p>}
        </div>
      </div>
    </div>
  );
}
