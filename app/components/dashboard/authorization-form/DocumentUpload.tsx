"use client";

import { Button } from "@/components/ui/button";
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaPaperclip, FaTimes } from "react-icons/fa";

interface DocumentUploadProps {
  title: string;
  docType: string;
  file: File | null;
  url: string | null;
  previewUrl?: string | null;
  uploading: boolean;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const DocumentUpload = ({
  title,
  docType,
  file,
  url,
  previewUrl,
  uploading,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemove,
}: DocumentUploadProps) => {

  const renderDocumentPreview = (previewUrl: string | null, url: string, fileName: string) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    const isPDF = /\.pdf$/i.test(fileName);

    // Usar previewUrl se disponível, senão usar url
    const imageUrl = previewUrl || url;

    if (isImage || isPDF) {
      return (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={fileName}
            className="w-full h-48 object-cover"
          />
          {isPDF && (
            <div className="absolute top-2 right-2 bg-[#960000] text-white text-xs px-2 py-1 rounded">
              PDF
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-48 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-center">
            <FaPaperclip className="text-4xl text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 truncate max-w-[200px]">{fileName}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border rounded-lg p-4 space-y-4 transition-all
        ${dragging
          ? 'border-[#960000] border-dashed'
          : url
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'}`}
    >
      <h4 className="text-sm font-medium text-gray-900">
        {title}
      </h4>

      {uploading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 min-h-[200px]">
          <FaSpinner className="animate-spin text-[#960000] text-3xl" />
          <p className="text-sm text-gray-600">Enviando...</p>
        </div>
      ) : url && file ? (
        <div className="space-y-3">
          {renderDocumentPreview(previewUrl || null, url, file.name)}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-green-700">
              <FaCheck className="text-green-600 text-sm" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium truncate max-w-[120px] hover:underline cursor-pointer"
                title="Clique para visualizar o documento"
              >
                {file.name}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
            >
              <FaTimes className="text-sm" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-500">
            <FaCloudUploadAlt className="text-3xl mb-2" />
            <p className="text-xs text-center">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
          </div>
          <input
            type="file"
            id={`${docType}-file`}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileSelect}
          />
          <label
            htmlFor={`${docType}-file`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#960000] text-white rounded-lg hover:bg-[#7a0000] transition-colors cursor-pointer text-sm font-medium"
          >
            <FaCloudUploadAlt />
            Selecionar Arquivo
          </label>
        </div>
      )}
    </div>
  );
};
