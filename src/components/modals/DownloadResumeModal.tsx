"use client";

import { FileText } from "lucide-react";
import { Modal } from "./Modal";
import { siteConfig } from "@/config/site";

interface ResumeOption {
  title: string;
  subtitle: string;
  description: string;
  filename: string;
}

interface DownloadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadResumeModal({ isOpen, onClose }: DownloadResumeModalProps) {
  const handleDownload = (option: ResumeOption) => {
    // Create a download link
    const link = document.createElement("a");
    link.href = `/resumes/${option.filename}`;
    link.download = option.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Resume"
      subtitle="Select the format that best fits your needs"
      icon={<FileText className="h-6 w-6 text-blue-500" />}
    >
      <div className="space-y-3">
        {siteConfig.resumes.map((option, index) => (
          <button
            key={index}
            onClick={() => handleDownload(option)}
            className="cursor-pointer w-full rounded-lg border border-gray-300 bg-gray-50/50 p-4 text-left transition-all hover:border-accent hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-900"
          >
            <div className="mb-1 font-medium text-gray-900 dark:text-white">{option.title}</div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">{option.subtitle}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="cursor-pointer px-6 py-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
