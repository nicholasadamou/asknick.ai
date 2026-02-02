"use client";

import { useEffect } from "react";

interface LinkedInTabProps {
  name: string;
  company: string;
  onNameChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
}

export function LinkedInTab({
  name,
  company,
  onNameChange,
  onCompanyChange,
}: LinkedInTabProps) {
  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinAuth = params.get("linkedin_auth");
    const profileData = params.get("profile");
    
    if (linkedinAuth === "success" && profileData) {
      try {
        const profile = JSON.parse(decodeURIComponent(profileData));
        if (profile.name) {
          onNameChange(profile.name);
        }
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
        alert("Profile imported successfully from LinkedIn!");
      } catch (e) {
        console.error("Failed to parse profile data:", e);
      }
    }
  }, [onNameChange]);

  const handleImportFromLinkedIn = () => {
    // Check if credentials are configured
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    
    if (!clientId) {
      alert(
        "LinkedIn OAuth is not configured.\\n\\n" +
        "To enable this feature:\\n" +
        "1. Create a LinkedIn app at https://www.linkedin.com/developers/\\n" +
        "2. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.local\\n" +
        "3. Add NEXT_PUBLIC_APP_URL to .env.local\\n" +
        "4. Restart your development server\\n\\n" +
        "Note: This uses LinkedIn's free OAuth API (no cost)"
      );
      return;
    }

    // Build LinkedIn OAuth URL
    const redirectUri = `${appUrl}/api/auth/linkedin/callback`;
    const scope = "openid profile email";
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
    
    // Redirect to LinkedIn OAuth
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 sm:px-4 sm:py-3"
        />
        <input
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Company"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 sm:px-4 sm:py-3"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>or</span>
        <button 
          onClick={handleImportFromLinkedIn}
          className="group flex items-center gap-1.5 cursor-pointer text-accent transition-colors hover:text-[#0A66C2]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-current" width="16" height="16">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>Sign in with LinkedIn</span>
        </button>
      </div>
    </div>
  );
}
