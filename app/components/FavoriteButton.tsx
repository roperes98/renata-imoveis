"use client";

import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { toggleFavoriteAction, checkFavoriteStatusAction } from "../lib/actions";

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
}

export default function FavoriteButton({ propertyId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check status on mount (if not provided prop-wise or to verify)
    // We can skip this if we trust initialIsFavorite, but for dynamic lists it's safer to check
    // or we rely on parent. Let's check to be safe as user wanted DB integration.
    let mounted = true;

    async function checkStatus() {
      try {
        const result = await checkFavoriteStatusAction(propertyId);
        if (mounted && result) {
          setIsFavorite(result.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        if (mounted) setHasChecked(true);
      }
    }

    checkStatus();

    return () => { mounted = false; };
  }, [propertyId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a card link
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const result = await toggleFavoriteAction(propertyId);

      if (result.error) {
        setIsFavorite(previousState);
        alert(result.error); // Simple feedback
      } else if (typeof result.isFavorite === 'boolean') {
        setIsFavorite(result.isFavorite);
      }

    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(previousState);
      alert("Erro ao atualizar favoritos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-3 rounded-full border transition-all self-end md:self-start z-10
        ${isFavorite
          ? 'bg-[#960000] border-[#960000] text-white'
          : 'border-gray-200 text-gray-400 hover:text-[#960000] hover:border-[#960000] bg-white'
        }
      `}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <FiHeart size={20} className={isFavorite ? "fill-current" : ""} />
    </button>
  );
}
