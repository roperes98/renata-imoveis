"use client";

import { useRef, useState, useEffect, Children } from "react";

interface CarouselProps {
  children: React.ReactNode;
}

export default function Carousel({ children }: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    // Add tolerance for scrollLeft (starts at 16px due to padding)
    setShowPrev(scrollLeft > 20);
    // Allow a small buffer (e.g., 1px) for float precision issues
    setShowNext(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    // Get the first item width to calculate stride
    const container = scrollContainerRef.current;
    const firstItem = container.firstElementChild as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth;
    const gap = 32; // gap-8 is 2rem = 32px
    const stride = itemWidth + gap;

    // Calculate how many items fit in the current view
    const itemsPerScreen = Math.floor(container.clientWidth / stride);

    // Scroll by at least one item, or the number of items that fit
    const scrollAmount = (itemsPerScreen || 1) * stride;
    const directionMultiplier = direction === "left" ? -1 : 1;

    container.scrollBy({
      left: scrollAmount * directionMultiplier,
      behavior: "smooth",
    });
  };

  const getMaskImage = () => {
    if (!showPrev && !showNext) return "none";
    if (showPrev && showNext) {
      return "linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)";
    }
    if (showPrev) {
      return "linear-gradient(to right, transparent 0%, black 24px, black 100%)";
    }
    if (showNext) {
      return "linear-gradient(to right, black 0%, black calc(100% - 24px), transparent 100%)";
    }
    return "none";
  };

  return (
    <div className="relative group">
      {/* Prev Button */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:cursor-pointer hover:bg-white transition-all duration-300 -ml-4 border border-gray-400 ${showPrev ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        aria-label="Previous"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#1e1e1e]"
        >
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-8 scroll-smooth hide-scrollbar pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maskImage: getMaskImage(),
          WebkitMaskImage: getMaskImage()
        }}
      >
        {Children.map(children, (child, index) => (
          <div key={index} className="flex-shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:cursor-pointer hover:bg-white transition-all duration-300 -mr-4 border border-gray-400 ${showNext ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        aria-label="Next"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#1e1e1e]"
        >
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
