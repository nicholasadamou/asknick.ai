"use client";

import { useState } from "react";
import { Lightbulb, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { SuggestQuestionFormData } from "@/types/chat";

interface SuggestQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestQuestionModal({ isOpen, onClose }: SuggestQuestionModalProps) {
  const [formData, setFormData] = useState<SuggestQuestionFormData>({
    question: "",
    context: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Form validation
  const minQuestionLength = 5;
  const isFormValid = formData.question.trim().length >= minQuestionLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/suggest-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: formData.question,
          context: formData.context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send suggestion");
      }

      const result = await response.json();
      console.log("Question suggestion sent:", result);
      
      setSubmitStatus("success");
      setFormData({ question: "", context: "" });
      
      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Error submitting question suggestion:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Suggest a Question"
      subtitle="What would you like to know?"
      icon={<Lightbulb className="h-6 w-6 text-blue-500" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p>Thank you! Your question suggestion has been sent successfully.</p>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Failed to send suggestion. Please try again or contact support.</p>
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400">
          I'll add your suggestion to my knowledge base so I can answer it better next time.
        </p>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your question *
          </label>
          <textarea
            placeholder="What would you like to know?"
            rows={4}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={`${
                formData.question.length > 0 && !isFormValid
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.question.length > 0 && !isFormValid
                ? `At least ${minQuestionLength} characters required`
                : `Minimum ${minQuestionLength} characters`}
            </span>
            <span
              className={`${
                isFormValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formData.question.length} / {minQuestionLength}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional context (optional)
          </label>
          <textarea
            placeholder="Why is this important? What were you looking for?"
            rows={3}
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Help me understand what you're looking for and why it matters to you.
          </p>
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
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}
