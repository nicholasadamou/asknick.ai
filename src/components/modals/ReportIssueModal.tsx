"use client";

import { useState } from "react";
import { Bug, Send, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { ReportIssueFormData } from "@/types/chat";
import { siteConfig } from "@/config/site";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const [formData, setFormData] = useState<ReportIssueFormData>({
    description: "",
    debugInfo: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Form validation
  const minDescriptionLength = 10;
  const isFormValid = formData.description.trim().length >= minDescriptionLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Capture debug info
    const debugInfo = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: formData.description,
          debugInfo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send report");
      }

      const result = await response.json();
      console.log("Issue report sent:", result);
      
      setSubmitStatus("success");
      setFormData({ description: "", debugInfo: {} });
      
      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Error submitting issue report:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const debugInfoPreview = typeof window !== 'undefined' ? {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  } : {
    userAgent: 'Unknown',
    timestamp: new Date().toISOString(),
    url: 'Unknown',
    screenSize: 'Unknown',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report a Bug"
      subtitle={`Help improve Ask ${siteConfig.name} by reporting issues`}
      icon={<Bug className="h-6 w-6 text-orange-500" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p>Thank you! Your report has been sent successfully.</p>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Failed to send report. Please try again or contact support.</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Describe the issue *
          </label>
          <textarea
            placeholder="What went wrong? Please be as specific as possible..."
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={`${
                formData.description.length > 0 && !isFormValid
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.description.length > 0 && !isFormValid
                ? `At least ${minDescriptionLength} characters required`
                : `Minimum ${minDescriptionLength} characters`}
            </span>
            <span
              className={`${
                isFormValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.description.length} / {minDescriptionLength}
            </span>
          </div>
        </div>

        {/* Debug Info Collapsible */}
        <div className="rounded-lg border border-gray-300 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="cursor-pointer flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-400"
          >
            <span>Debug Info (auto-captured)</span>
            {showDebugInfo ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showDebugInfo && (
            <div className="border-t border-gray-300 p-4 dark:border-gray-800">
              <p className="mb-2 text-xs text-gray-500">
                Technical details sent with report
              </p>
              <pre className="overflow-x-auto text-xs text-gray-600 dark:text-gray-400">
                {JSON.stringify(debugInfoPreview, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-6 py-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send Report
          </button>
        </div>
      </form>
    </Modal>
  );
}
