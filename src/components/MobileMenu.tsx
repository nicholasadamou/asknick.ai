"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, ExternalLink, Lightbulb, Bug, X } from "lucide-react";
import { ScheduleCallModal } from "./modals/ScheduleCallModal";
import { DownloadResumeModal } from "./modals/DownloadResumeModal";
import { SuggestQuestionModal } from "./modals/SuggestQuestionModal";
import { ReportIssueModal } from "./modals/ReportIssueModal";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  const [downloadResumeOpen, setDownloadResumeOpen] = useState(false);
  const [suggestQuestionOpen, setSuggestQuestionOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);

  const menuItems = [
    {
      label: "Schedule a Call",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      onClick: () => {
        setScheduleCallOpen(true);
        onClose();
      },
    },
    {
      label: "Download Resume",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      onClick: () => {
        setDownloadResumeOpen(true);
        onClose();
      },
    },
    {
      label: "View LinkedIn",
      icon: <ExternalLink className="h-5 w-5 text-blue-400" />,
      onClick: () => {
        window.open("https://www.linkedin.com/in/nicholasadamou", "_blank");
        onClose();
      },
    },
    {
      label: "Suggest a Question",
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
      onClick: () => {
        setSuggestQuestionOpen(true);
        onClose();
      },
    },
    {
      label: "Report Issue",
      icon: <Bug className="h-5 w-5 text-orange-500" />,
      onClick: () => {
        setReportIssueOpen(true);
        onClose();
      },
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={onClose}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Next Steps
                </h3>
                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Safe area padding for iOS */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ScheduleCallModal isOpen={scheduleCallOpen} onClose={() => setScheduleCallOpen(false)} />
      <DownloadResumeModal isOpen={downloadResumeOpen} onClose={() => setDownloadResumeOpen(false)} />
      <SuggestQuestionModal isOpen={suggestQuestionOpen} onClose={() => setSuggestQuestionOpen(false)} />
      <ReportIssueModal isOpen={reportIssueOpen} onClose={() => setReportIssueOpen(false)} />
    </>
  );
}
