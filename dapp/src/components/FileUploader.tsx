"use client";

import React, { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

interface FileUploaderProps {
  onHashComputed: (hash: string, fileName: string) => void;
  hash: string | null;
  fileName: string | null;
  isHashing: boolean;
  computeHash: (file: File) => Promise<string | null>;
  reset: () => void;
}

export default function FileUploader({
  onHashComputed,
  hash,
  fileName,
  isHashing,
  computeHash,
  reset,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await computeHash(file);
    if (result) {
      onHashComputed(result, file.name);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const result = await computeHash(file);
    if (result) {
      onHashComputed(result, file.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleReset = () => {
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {!hash ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/10"
        >
          <Upload
            size={32}
            className="text-zinc-400 dark:text-zinc-500"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isHashing ? "Computing hash..." : "Click or drag & drop a file"}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              PDF, images, documents — any file type
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FileText
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {fileName}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-green-700 dark:text-green-400">
                  {hash}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="rounded-md p-1 text-green-600 hover:bg-green-200 dark:text-green-400 dark:hover:bg-green-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
