"use client";

import { Building2 } from "lucide-react";
import { JobBoardTab } from "./JobBoardTab";

interface GreenhouseTabProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onClear: () => void;
}

export function GreenhouseTab({ 
  jobDescription, 
  onJobDescriptionChange, 
  onClear 
}: GreenhouseTabProps) {
  return (
    <JobBoardTab
      jobDescription={jobDescription}
      onJobDescriptionChange={onJobDescriptionChange}
      onClear={onClear}
      icon={Building2}
      title="Greenhouse Job Listing"
      placeholder="Paste job description from Greenhouse or any other source..."
      apiEndpoint="/api/fetch-greenhouse"
      urlPlaceholder="Paste Greenhouse job URL (e.g., job-boards.greenhouse.io/...)..."
    />
  );
}
