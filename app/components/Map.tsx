import React from "react";

interface MapProps {
  address: string;
}

export default function Map({ address }: MapProps) {
  const encodedAddress = encodeURIComponent(address);
  // Using the new embed API format (no key needed for basic place search in some contexts, but ideally would use an API key if available. 
  // For this "demo" / free usage, we can use the maps/embed/v1/place endpoint if we had a key, or the older output=embed format which is often used for simple free embeds).
  // A standard reliable way without a key for simple display is the "maps?q=" with output=embed.
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <iframe
        width="100%"
        height="100%"
        src={mapUrl}
        title="Map showing property location"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
