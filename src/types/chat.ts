export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Context {
  linkedInProfile?: string;
  jobUrl?: string;
  glassdoorJobDescription?: string;
  greenhouseJobDescription?: string;
  pastedText?: string;
  uploadedImages?: File[] | string; // File[] in frontend, string when sent to API
  uploadedFiles?: File[] | string;  // File[] in frontend, string when sent to API
}

export interface ChatRequest {
  message: string;
  threadId?: string;
  context?: Context;
}

export interface ChatResponse {
  response?: string;
  threadId?: string;
  error?: string;
}

export type ResumeFormat = "standard-resume";

export interface ScheduleCallFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
}

export interface SuggestQuestionFormData {
  question: string;
  context?: string;
}

export interface ReportIssueFormData {
  description: string;
  debugInfo?: Record<string, unknown>;
}
