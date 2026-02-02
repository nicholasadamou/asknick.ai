"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, PlusCircle, FileText, Image as ImageIcon, File, Trash2, Briefcase, Building2 } from "lucide-react";
import { Context } from "@/types/chat";
import { LinkedInTab } from "./context-drawer/LinkedInTab";
import { TextTab } from "./context-drawer/TextTab";
import { ImagesTab } from "./context-drawer/ImagesTab";
import { FilesTab } from "./context-drawer/FilesTab";
import { GreenhouseTab } from "./context-drawer/GreenhouseTab";
import { TabButton } from "./context-drawer/TabButton";

interface ContextDrawerProps {
  context: Context;
  onContextChange: (context: Context) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

type TabType = "linkedin" | "glassdoor" | "greenhouse" | "other" | "images" | "files";

export function ContextDrawer({ context, onContextChange, isOpen: controlledIsOpen, onToggle }: ContextDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>("linkedin");
  const [name, setName] = useState(context.linkedInProfile || "");
  const [company, setCompany] = useState(context.jobUrl || "");
  const [jobDescription, setJobDescription] = useState("");
  const [greenhouseJobDescription, setGreenhouseJobDescription] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("chat-context");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setName(parsed.linkedInProfile || "");
        setCompany(parsed.jobUrl || "");
        setJobDescription(parsed.glassdoorJobDescription || "");
        setGreenhouseJobDescription(parsed.greenhouseJobDescription || "");
        setPastedText(parsed.pastedText || "");
        // Note: Files can't be restored from session storage
        onContextChange(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to session storage when context changes
  useEffect(() => {
    const newContext: Context = {
      linkedInProfile: name || undefined,
      jobUrl: company || undefined,
      glassdoorJobDescription: jobDescription || undefined,
      greenhouseJobDescription: greenhouseJobDescription || undefined,
      pastedText: pastedText || undefined,
      uploadedImages: uploadedImages.length > 0 ? uploadedImages : undefined,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };
    
    // Save to session storage (excluding File objects)
    const storableContext = {
      linkedInProfile: name || undefined,
      jobUrl: company || undefined,
      glassdoorJobDescription: jobDescription || undefined,
      greenhouseJobDescription: greenhouseJobDescription || undefined,
      pastedText: pastedText || undefined,
      // Files can't be stored in session storage
    };
    sessionStorage.setItem("chat-context", JSON.stringify(storableContext));
    
    onContextChange(newContext);
  }, [name, company, jobDescription, greenhouseJobDescription, pastedText, uploadedImages, uploadedFiles, onContextChange]);

  const hasContext = name || company || jobDescription || greenhouseJobDescription || pastedText || uploadedImages.length > 0 || uploadedFiles.length > 0;

  const clearAllContext = () => {
    setName("");
    setCompany("");
    setJobDescription("");
    setGreenhouseJobDescription("");
    setPastedText("");
    setUploadedImages([]);
    setUploadedFiles([]);
    sessionStorage.removeItem("chat-context");
    onContextChange({});
  };

  // Keyboard shortcuts for tab navigation when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      const tabs: TabType[] = ["linkedin", "glassdoor", "greenhouse", "other", "images", "files"];

      // Cmd/Ctrl + Backspace to clear all context
      if ((e.metaKey || e.ctrlKey) && e.key === "Backspace" && hasContext) {
        e.preventDefault();
        clearAllContext();
        return;
      }

      // Numbers 1-6 to switch between tabs
      if (e.key === "1") {
        e.preventDefault();
        setActiveTab("linkedin");
      } else if (e.key === "2") {
        e.preventDefault();
        setActiveTab("glassdoor");
      } else if (e.key === "3") {
        e.preventDefault();
        setActiveTab("greenhouse");
      } else if (e.key === "4") {
        e.preventDefault();
        setActiveTab("other");
      } else if (e.key === "5") {
        e.preventDefault();
        setActiveTab("images");
      } else if (e.key === "6") {
        e.preventDefault();
        setActiveTab("files");
      }
      // Arrow keys to navigate between tabs
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = tabs.indexOf(activeTab);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        setActiveTab(tabs[prevIndex]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        setActiveTab(tabs[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab, name, company, pastedText, uploadedImages.length, uploadedFiles.length]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedImages(prev => [...prev, ...imageFiles]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const contextCount = [name, company, jobDescription, greenhouseJobDescription, pastedText].filter(Boolean).length + uploadedImages.length + uploadedFiles.length;

  const getContextSummary = () => {
    const items: Array<{ icon: React.ReactNode; text: string }> = [];

    const linkedInCount = [name, company].filter(Boolean).length;
    if (linkedInCount > 0) {
      items.push({
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" className="fill-current">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        ),
        text: `${linkedInCount}`,
      });
    }

    if (jobDescription) {
      items.push({
        icon: <Briefcase className="h-3.5 w-3.5" />,
        text: '1',
      });
    }

    if (greenhouseJobDescription) {
      items.push({
        icon: <Building2 className="h-3.5 w-3.5" />,
        text: '1',
      });
    }

    if (pastedText) {
      items.push({
        icon: <FileText className="h-3.5 w-3.5" />,
        text: '1',
      });
    }

    if (uploadedImages.length > 0) {
      items.push({
        icon: <ImageIcon className="h-3.5 w-3.5" />,
        text: `${uploadedImages.length}`,
      });
    }

    if (uploadedFiles.length > 0) {
      items.push({
        icon: <File className="h-3.5 w-3.5" />,
        text: `${uploadedFiles.length}`,
      });
    }

    return items;
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 sm:px-6 sm:py-4 sm:text-sm"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <PlusCircle className="h-4 w-4 text-blue-500 dark:text-accent sm:h-5 sm:w-5" />
          {hasContext && !isOpen ? (
            <div className="flex items-center gap-2">
              {getContextSummary().map((item, index) => (
                <div key={index} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">{item.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {hasContext ? "Context added" : "Add context for personalized responses"}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Header with Clear Button */}
            {hasContext && (
              <div className="flex items-center justify-between border-b border-gray-300 px-4 py-2 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Context
                </span>
                <button
                  onClick={clearAllContext}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-300 dark:border-gray-700">
              <TabButton
                isActive={activeTab === "linkedin"}
                onClick={() => setActiveTab("linkedin")}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="fill-current">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
                label="LinkedIn"
                hasContext={[name, company].filter(Boolean).length > 0}
              />
              <TabButton
                isActive={activeTab === "greenhouse"}
                onClick={() => setActiveTab("greenhouse")}
                icon={<Building2 className="h-4 w-4" />}
                label="Greenhouse"
                hasContext={!!greenhouseJobDescription}
              />
              <TabButton
                isActive={activeTab === "other"}
                onClick={() => setActiveTab("other")}
                icon={<FileText className="h-4 w-4" />}
                label="Text"
                hasContext={!!pastedText}
              />
              <TabButton
                isActive={activeTab === "images"}
                onClick={() => setActiveTab("images")}
                icon={<ImageIcon className="h-4 w-4" />}
                label="Images"
                hasContext={uploadedImages.length > 0}
              />
              <TabButton
                isActive={activeTab === "files"}
                onClick={() => setActiveTab("files")}
                icon={<File className="h-4 w-4" />}
                label="Files"
                hasContext={uploadedFiles.length > 0}
              />
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === "linkedin" && (
                <LinkedInTab
                  name={name}
                  company={company}
                  onNameChange={setName}
                  onCompanyChange={setCompany}
                />
              )}

              {activeTab === "greenhouse" && (
                <GreenhouseTab
                  jobDescription={greenhouseJobDescription}
                  onJobDescriptionChange={setGreenhouseJobDescription}
                  onClear={() => setGreenhouseJobDescription("")}
                />
              )}

              {activeTab === "other" && (
                <TextTab
                  pastedText={pastedText}
                  onPastedTextChange={setPastedText}
                  onClear={() => setPastedText("")}
                />
              )}

              {activeTab === "images" && (
                <ImagesTab
                  uploadedImages={uploadedImages}
                  imageInputRef={imageInputRef}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                />
              )}

              {activeTab === "files" && (
                <FilesTab
                  uploadedFiles={uploadedFiles}
                  fileInputRef={fileInputRef}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeFile}
                  formatFileSize={formatFileSize}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
