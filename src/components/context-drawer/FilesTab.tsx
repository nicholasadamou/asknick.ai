"use client";

import { File, X } from "lucide-react";
import { RefObject } from "react";
import { DragDropUpload } from "./DragDropUpload";

interface FilesTabProps {
  uploadedFiles: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  formatFileSize: (bytes: number) => string;
}

export function FilesTab({
  uploadedFiles,
  fileInputRef,
  onFileUpload,
  onRemoveFile,
  formatFileSize,
}: FilesTabProps) {
  return (
    <div className="space-y-4">
      <DragDropUpload
        inputRef={fileInputRef}
        onChange={onFileUpload}
        icon={<File className="h-5 w-5" />}
        label="Click to upload files or drag and drop"
      />
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files ({uploadedFiles.length})
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <File className="h-5 w-5 shrink-0 text-gray-600 dark:text-gray-400" />
                  <div className="overflow-hidden">
                    <div className="truncate text-sm text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="cursor-pointer shrink-0 text-red-500 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
