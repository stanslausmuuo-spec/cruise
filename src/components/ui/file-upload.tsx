"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

interface FileState {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  error?: string;
  storageId?: string;
}

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  onFilesChange?: (files: FileState[]) => void;
}

export function FileUpload({
  label = "Upload files",
  accept = "image/png,image/jpeg,image/webp",
  maxFiles = 10,
  maxSizeMB = 10,
  disabled = false,
  onFilesChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFiles = useCallback(
    (newFiles: FileState[]) => {
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [onFilesChange]
  );

  const handleUpload = useCallback(
    async (file: File, index: number) => {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });

        if (!response.ok) throw new Error("Failed to get upload URL");

        const { uploadUrl, storageId } = await response.json();

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) throw new Error("Upload failed");

        updateFiles(
          files.map((f, i) =>
            i === index ? { ...f, uploading: false, progress: 100, storageId } : f
          )
        );
      } catch (error) {
        updateFiles(
          files.map((f, i) =>
            i === index ? { ...f, uploading: false, error: error instanceof Error ? error.message : "Upload failed" } : f
          )
        );
      }
    },
    [files, updateFiles]
  );

  const addFiles = useCallback(
    (fileList: FileList) => {
      const newFiles = Array.from(fileList).slice(0, maxFiles - files.length);
      if (newFiles.length === 0) return;

      const newFileStates = newFiles.map((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          return {
            file,
            preview: "",
            uploading: false,
            progress: 0,
            error: `File exceeds ${maxSizeMB}MB limit`,
          };
        }
        return {
          file,
          preview: URL.createObjectURL(file),
          uploading: true,
          progress: 0,
        };
      });

      const updatedFiles = [...files, ...newFileStates];
      updateFiles(updatedFiles);

      newFileStates.forEach((_, i) => {
        const index = files.length + i;
        if (!newFileStates[i].error) {
          handleUpload(newFileStates[i].file, index);
        }
      });
    },
    [files, maxFiles, maxSizeMB, updateFiles, handleUpload]
  );

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(files[index].preview);
      updateFiles(files.filter((_, i) => i !== index));
    },
    [files, updateFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
    [addFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const allUploaded = files.length > 0 && files.every((f) => !f.uploading && !f.error);
  const hasErrors = files.some((f) => f.error);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200",
          isDragActive
            ? "border-brand-gold-400 bg-brand-gold-400/5"
            : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || files.length >= maxFiles}
          aria-label={label}
        />

        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-10 w-10 text-charcoal/30 dark:text-cream/30 mb-3" />
          <p className="text-sm font-medium text-charcoal/70 dark:text-cream/70">{label}</p>
          <p className="text-xs text-charcoal/40 dark:text-cream/40 mt-1">
            {files.length}/{maxFiles} files &bull; PNG, JPG, WebP up to {maxSizeMB}MB
          </p>
          {isDragActive && (
            <p className="text-sm text-brand-gold-400 mt-2 font-medium">Drop files here...</p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileState, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                fileState.error
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "glass"
              )}
            >
              {fileState.preview ? (
                <img
                  src={fileState.preview}
                  alt={fileState.file.name}
                  className="h-14 w-14 object-cover rounded-lg"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-charcoal/10 dark:bg-white/10 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-charcoal/30" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal dark:text-cream truncate">
                  {fileState.file.name}
                </p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">
                  {(fileState.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                {fileState.uploading && (
                  <div className="mt-1 h-1.5 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gold-400 transition-all duration-300"
                      style={{ width: `${fileState.progress}%` }}
                    />
                  </div>
                )}
                {fileState.error && (
                  <p className="text-xs text-red-500 mt-1">{fileState.error}</p>
                )}
              </div>

              {fileState.uploading ? (
                <Loader2 className="h-5 w-5 text-brand-gold-400 animate-spin" />
              ) : fileState.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : fileState.storageId ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1.5 text-charcoal/40 hover:text-red-500 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {allUploaded && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          All {files.length} file{files.length !== 1 ? "s" : ""} uploaded successfully
        </p>
      )}

      {hasErrors && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Some files failed to upload. Please retry or remove them.
        </p>
      )}
    </div>
  );
}