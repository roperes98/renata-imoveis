import React, { useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaPencilAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichEditor } from "@/components/ui/rich-editor";
import { Badge } from "@/components/ui/badge";
import { PropertyFormData, MediaItem } from "../types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaStepProps {
  formData: PropertyFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addFiles: (files: File[]) => void;
  removeMediaItem: (id: string) => void;
  updateMediaItemLabel: (id: string, label: string) => void;
}

// Sortable Item Component
function SortablePhoto({
  item,
  index,
  removeMediaItem,
  updateMediaItemLabel
}: {
  item: MediaItem;
  index: number;
  removeMediaItem: (id: string) => void;
  updateMediaItemLabel: (id: string, label: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-lg overflow-hidden border shadow-sm ${index === 0 ? 'ring-2 ring-primary' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="aspect-square relative cursor-move bg-gray-100"
      >
        <img src={item.url} alt={`Photo ${index + 1}`} className="object-cover w-full h-full" />

        {index === 0 && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="default" className="bg-primary text-white hover:bg-primary">
              Capa
            </Badge>
          </div>
        )}

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
          onClick={() => removeMediaItem(item.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20 hover:bg-red-600"
        >
          <FaTimes className="h-3 w-3" />
        </button>
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] z-20 flex justify-center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <Input
              autoFocus
              value={item.label}
              onChange={(e) => updateMediaItemLabel(item.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
              className="bg-black/60 hover:bg-black/70 text-white text-[10px] gap-2.5 px-4 py-1.5 rounded-full truncate max-w-full cursor-pointer flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105"
              placeholder="Legenda..."
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="bg-black/60 hover:bg-black/70 text-white text-[10px] gap-2.5 px-4 py-1.5 rounded-full truncate max-w-full cursor-pointer flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105"
            >
              <span className="truncate max-w-[120px]">{item.label || "Adicionar legenda"}</span>
              {!item.label && <FaPencilAlt className="h-2 w-2 opacity-70" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaStep({
  formData,
  handleChange,
  mediaItems,
  setMediaItems,
  handleImageChange,
  addFiles,
  removeMediaItem,
  updateMediaItemLabel
}: MediaStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px before drag starts matches standard behavior
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging if not already set to avoid flickers
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we are leaving the main container to an external element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;

    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (filesArray.length > 0) {
        addFiles(filesArray);
      }
    }
  };

  return (
    <div className="space-y-6">

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Fotos ({mediaItems.length})</label>
          {mediaItems.length > 0 && (
            <label htmlFor="images-upload-add" className="text-sm text-primary hover:underline cursor-pointer font-medium">
              + Adicionar fotos
              <input id="images-upload-add" name="images-upload-add" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Unified Area */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
             min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-all relative
             ${isDragging ? 'border-primary bg-primary/10' : (mediaItems.length === 0 ? 'border-gray-300 bg-gray-50 flex items-center justify-center' : 'border-gray-200 bg-white')}
        `}>

          {mediaItems.length === 0 ? (
            <div className="space-y-1 text-center pointer-events-none">
              <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label htmlFor="images-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary pointer-events-auto">
                  <span>Upload de arquivos</span>
                  <input id="images-upload" name="images-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
            </div>
          ) : (
            <div className="pointer-events-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={mediaItems.map(i => i.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {mediaItems.map((item, index) => (
                      <SortablePhoto
                        key={item.id}
                        item={item}
                        index={index}
                        removeMediaItem={removeMediaItem}
                        updateMediaItemLabel={updateMediaItemLabel}
                      />
                    ))}

                    {/* Dropzone card for adding more at the end */}
                    <label
                      htmlFor="images-upload-grid"
                      className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <FaCloudUploadAlt className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-2 font-medium">Adicionar</span>
                      <input id="images-upload-grid" name="images-upload-grid" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

        </div>
      </div>

      {/* Watermark Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Marca D'água</label>
          <Select
            value={formData.watermark_source || "none"}
            onValueChange={(val) => handleChange({ target: { name: 'watermark_source', value: val } } as any)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem Marca D'água</SelectItem>
              <SelectItem value="logo_light">Logo Branca</SelectItem>
              <SelectItem value="logo_dark">Logo Escura</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Posição</label>
          <Select
            value={formData.watermark_position || "center"}
            onValueChange={(val) => handleChange({ target: { name: 'watermark_position', value: val } } as any)}
            disabled={formData.watermark_source === 'none'}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="top-left">Canto Superior Esquerdo</SelectItem>
              <SelectItem value="top-right">Canto Superior Direito</SelectItem>
              <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
              <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Intensidade</label>
          <Select
            value={formData.watermark_opacity || "50"}
            onValueChange={(val) => handleChange({ target: { name: 'watermark_opacity', value: val } } as any)}
            disabled={formData.watermark_source === 'none'}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Muito Suave (25%)</SelectItem>
              <SelectItem value="50">Suave (50%)</SelectItem>
              <SelectItem value="75">Forte (75%)</SelectItem>
              <SelectItem value="100">Total (100%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-1">Vídeo (YouTube)</label>
          <Input type="text" name="youtube_url" id="youtube_url"
            value={formData.youtube_url} onChange={handleChange}
            placeholder="https://youtube.com/..."
          />
        </div>
        <div>
          <label htmlFor="virtual_tour_url" className="block text-sm font-medium text-gray-700 mb-1">Tour Virtual</label>
          <Input type="text" name="virtual_tour_url" id="virtual_tour_url"
            value={formData.virtual_tour_url} onChange={handleChange}
            placeholder="URL do tour virtual"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <RichEditor
          value={formData.description}
          onChange={(val: string) => handleChange({ target: { name: 'description', value: val } } as any)}
          placeholder="Descreva o imóvel detalhadamente..."
        />
      </div>
    </div>
  );
}
