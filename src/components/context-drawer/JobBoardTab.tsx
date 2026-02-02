"use client";

import { useState } from "react";
import { Link2, Loader2, LucideIcon } from "lucide-react";

interface JobBoardTabProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onClear: () => void;
  icon: LucideIcon;
  title: string;
  placeholder: string;
  apiEndpoint: string;
  urlPlaceholder?: string;
}

export function JobBoardTab({
  jobDescription,
  onJobDescriptionChange,
  onClear,
  icon: Icon,
  title,
  placeholder,
  apiEndpoint,
  urlPlaceholder = "Paste job URL...",
}: JobBoardTabProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetchJobDescription = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job description");
      }

      onJobDescriptionChange(data.jobDescription);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job description");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleFetchJobDescription();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyPress}
                placeholder={urlPlaceholder}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleFetchJobDescription}
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <span>Fetch</span>
              )}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>or paste manually below</span>
        </div>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-colors focus:border-accent dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 sm:px-4 sm:py-3"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {jobDescription.length} characters
        </span>
        {jobDescription && (
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
