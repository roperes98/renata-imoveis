"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FiCamera, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal, nextImage, prevImage]);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden relative">
        <div
          className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
          onClick={() => openModal(0)}
        >
          <Image
            src={images[0]}
            alt="Principal"
            fill
            className="object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-110"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="hidden md:block col-span-1 row-span-1 relative cursor-pointer overflow-hidden"
            onClick={() => openModal(idx + 1)}
          >
            <div className="relative w-full h-full group">
              <Image
                src={img}
                alt={`Foto ${idx + 2}`}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-110"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            {idx === 3 && (
              <button
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white hover:cursor-pointer text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(0);
                }}
              >
                <FiCamera />
                Todas as fotos
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          >
            <FiX size={24} />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden md:flex"
          >
            <FiChevronLeft size={32} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden md:flex"
          >
            <FiChevronRight size={32} />
          </button>

          {/* Image Container */}
          <div
            className="relative w-full max-w-5xl h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking image area
          >
            <div className="relative w-full h-[80vh]">
              <Image
                src={images[currentIndex]}
                alt={`Foto ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
                quality={100}
              />
            </div>

            {/* Counter */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-white/90 font-medium">
              {currentIndex + 1} de {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
