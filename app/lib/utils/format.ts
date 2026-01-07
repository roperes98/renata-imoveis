// Utility functions for formatting property data

export function formatPrice(price: number | null): string {
  if (!price) return "Consulte";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number): string {
  return `${area.toFixed(0)}m²`;
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: "Apartamento",
    village_house: "Casa de Vila",
    penthouse: "Cobertura",
    farm: "Fazenda",
    flat: "Flat",
    kitnet: "Kitnet",
    loft: "Loft",
    allotment_land: "Terreno",
    building: "Prédio",
    studio: "Studio",
    house: "Casa",
    gated_community_house: "Casa em Condomínio",
  };

  return labels[type] || type;
}

export function getNeighborhoodLabel(neighborhood: string): string {
  return neighborhood;
}


export function getDaysSinceCreated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInTime = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 0) {
    return "Publicado hoje";
  } else if (diffInDays < 30) {
    return diffInDays === 1 ? "Publicado há 1 dia" : `Publicado há ${diffInDays} dias`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "Publicado há 1 mês" : `Publicado há ${months} meses`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "Publicado há 1 ano" : `Publicado há ${years} anos`;
  }
}

export function getDaysSinceUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInTime = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  if (diffInDays === 0) {
    return "Atualizado hoje";
  } else if (diffInDays < 30) {
    return diffInDays === 1 ? "Atualizado há 1 dia" : `Atualizado há ${diffInDays} dias`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "Atualizado há 1 mês" : `Atualizado há ${months} meses`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "Atualizado há 1 ano" : `Atualizado há ${years} anos`;
  }
}