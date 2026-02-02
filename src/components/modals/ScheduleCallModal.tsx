"use client";

import { useState } from "react";
import { Calendar, Send } from "lucide-react";
import { Modal } from "./Modal";
import { ScheduleCallFormData } from "@/types/chat";

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleCallModal({ isOpen, onClose }: ScheduleCallModalProps) {
  const [formData, setFormData] = useState<ScheduleCallFormData>({
    name: "",
    email: "",
    company: "",
    role: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form - name and email are required
  const isFormValid = formData.name.trim() !== "" && formData.email.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build Calendly URL with pre-filled information
      // Replace with your actual Calendly username/link
      const calendlyUsername = "nicholasadamou"; // Update with your Calendly username
      const baseUrl = `https://calendly.com/${calendlyUsername}`;
      
      // Build query parameters for pre-filling form
      const params = new URLSearchParams();
      
      if (formData.name) {
        params.append("name", formData.name);
      }
      if (formData.email) {
        params.append("email", formData.email);
      }
      
      // Add custom questions as URL parameters
      const customAnswers: Record<string, string> = {};
      if (formData.company) {
        customAnswers["a1"] = formData.company; // Company
      }
      if (formData.role) {
        customAnswers["a2"] = formData.role; // Role
      }
      if (formData.notes) {
        customAnswers["a3"] = formData.notes; // Notes
      }
      
      // Append custom answers to params
      Object.entries(customAnswers).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      // Open Calendly in a new tab with pre-filled data
      const calendlyUrl = `${baseUrl}?${params.toString()}`;
      window.open(calendlyUrl, "_blank", "noopener,noreferrer");
      
      // Optional: Send data to your backend for tracking/analytics
      try {
        await fetch("/api/schedule-call", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to log scheduling attempt:", error);
        // Don't block the user if analytics fails
      }
    } catch (error) {
      console.error("Failed to open calendar booking:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Let's get you scheduled"
      subtitle="Feel free to edit or skip any of these"
      icon={<Calendar className="h-6 w-6 text-green-500" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Role you're exploring"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div>
          <textarea
            placeholder="Anything else? (optional)"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-accent dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
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
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Calendar className="h-4 w-4" />
            Book the Call
          </button>
        </div>
      </form>
    </Modal>
  );
}
