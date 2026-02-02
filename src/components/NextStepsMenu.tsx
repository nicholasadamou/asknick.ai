"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, FileText, ExternalLink, Lightbulb, Bug, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScheduleCallModal } from "./modals/ScheduleCallModal";
import { DownloadResumeModal } from "./modals/DownloadResumeModal";
import { SuggestQuestionModal } from "./modals/SuggestQuestionModal";
import { ReportIssueModal } from "./modals/ReportIssueModal";

export function NextStepsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  const [downloadResumeOpen, setDownloadResumeOpen] = useState(false);
  const [suggestQuestionOpen, setSuggestQuestionOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      // Cmd/Ctrl + Shift + S: Schedule a Call
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "s") {
        e.preventDefault();
        setScheduleCallOpen(true);
      }
      // Cmd/Ctrl + Shift + D: Download Resume
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "d") {
        e.preventDefault();
        setDownloadResumeOpen(true);
      }
      // Cmd/Ctrl + Shift + L: View LinkedIn
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "l") {
        e.preventDefault();
        window.open("https://www.linkedin.com/in/nicholasadamou", "_blank");
      }
      // Cmd/Ctrl + Shift + Q: Suggest a Question
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "q") {
        e.preventDefault();
        setSuggestQuestionOpen(true);
      }
      // Cmd/Ctrl + Shift + R: Report Issue
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "r") {
        e.preventDefault();
        setReportIssueOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        setButtonRect(buttonRef.current!.getBoundingClientRect());
      };
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen]);

  const menuItems = [
    {
      label: "Schedule a Call",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      onClick: () => {
        setScheduleCallOpen(true);
        setIsOpen(false);
      },
    },
    {
      label: "Download Resume",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      onClick: () => {
        setDownloadResumeOpen(true);
        setIsOpen(false);
      },
    },
    {
      label: "View LinkedIn",
      icon: <ExternalLink className="h-5 w-5 text-blue-400" />,
      onClick: () => {
        window.open("https://www.linkedin.com/in/nicholasadamou", "_blank");
        setIsOpen(false);
      },
    },
    {
      label: "Suggest a Question",
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
      onClick: () => {
        setSuggestQuestionOpen(true);
        setIsOpen(false);
      },
    },
    {
      label: "Report Issue",
      icon: <Bug className="h-5 w-5 text-orange-500" />,
      onClick: () => {
        setReportIssueOpen(true);
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <div className="relative hidden sm:block">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all hover:border-accent hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>Next Steps</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mounted && createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'fixed',
                    bottom: buttonRect ? `${window.innerHeight - buttonRect.top + 8}px` : '0',
                    right: buttonRect ? `${window.innerWidth - buttonRect.right}px` : '0',
                  }}
                  className="z-50 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="py-2">
                    {menuItems.map((item, index) => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="flex w-full items-center cursor-pointer gap-3 px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {/* Modals */}
      <ScheduleCallModal isOpen={scheduleCallOpen} onClose={() => setScheduleCallOpen(false)} />
      <DownloadResumeModal isOpen={downloadResumeOpen} onClose={() => setDownloadResumeOpen(false)} />
      <SuggestQuestionModal isOpen={suggestQuestionOpen} onClose={() => setSuggestQuestionOpen(false)} />
      <ReportIssueModal isOpen={reportIssueOpen} onClose={() => setReportIssueOpen(false)} />
    </>
  );
}
