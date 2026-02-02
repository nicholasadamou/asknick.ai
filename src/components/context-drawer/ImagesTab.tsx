"use client";

import { Image as ImageIcon, X } from "lucide-react";
import { RefObject } from "react";
import { DragDropUpload } from "./DragDropUpload";

interface ImagesTabProps {
  uploadedImages: File[];
  imageInputRef: RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export function ImagesTab({
  uploadedImages,
  imageInputRef,
  onImageUpload,
  onRemoveImage,
}: ImagesTabProps) {
  return (
    <div className="space-y-4">
      <DragDropUpload
        inputRef={imageInputRef}
        accept="image/*"
        onChange={onImageUpload}
        icon={<ImageIcon className="h-5 w-5" />}
        label="Click to upload images or drag and drop"
      />
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Images ({uploadedImages.length})
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="cursor-pointer absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white truncate">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
