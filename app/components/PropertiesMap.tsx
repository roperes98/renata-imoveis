"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import { RealEstate } from "../lib/types/database";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import MarkerClusterGroup from "react-leaflet-cluster";

// ... existing imports

interface PropertiesMapProps {
  properties: RealEstate[]; // Filtered/Active properties
  allProperties?: RealEstate[]; // All properties for map
  autoFocus?: boolean;
  isFiltering?: boolean;
}

function MapController({ properties, autoFocus }: { properties: RealEstate[], autoFocus: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (autoFocus && properties.length > 0) {
      const first = properties[0];
      if (first.address_lat && first.address_lng) {
        map.flyTo([first.address_lat, first.address_lng], 16, {
          duration: 1.5
        });
      }
    }
  }, [properties, autoFocus, map]);

  return null;
}

export default function PropertiesMap({ properties, allProperties = [], autoFocus = false, isFiltering = false }: PropertiesMapProps) {
  // Center of Rio de Janeiro
  const defaultCenter = [-22.9068, -43.1729] as [number, number];
  const [clickedId, setClickedId] = useState<string | null>(null);

  // Reset clicked ID when filters change (properties list changes)
  useEffect(() => {
    setClickedId(null);
  }, [properties]);

  // Use allProperties if available (for displaying all pins), otherwise use only filtered properties.
  const displayProperties = allProperties.length > 0 ? allProperties : properties;

  // Create a set of active property IDs for fast lookup
  const activeIds = new Set(properties.map(p => p.id));

  // Determine if we are in a "filtered state" (where some things might be transparent)
  // We are in filtered state only if WE ARE FILTERING, we have allProperties AND the filtered list is smaller than allProperties
  const isFilteredState = isFiltering && allProperties.length > 0 && properties.length < allProperties.length;

  // Function to check if a specific ID should be treated as "active" (opaque)
  const isIdActive = (id: string) => {
    if (!isFilteredState) return true; // If not filtering, everything is active
    return activeIds.has(id) || clickedId === id;
  };

  // Filter valid properties (must have coords)
  const validProperties = displayProperties.filter(p => p.address_lat && p.address_lng);

  const createClusterCustomIcon = function (cluster: any) {
    const markers = cluster.getAllChildMarkers();
    // Check if any marker in the cluster is active
    // We rely on the marker having a 'title' attribute set to the property ID
    const hasActiveMarker = markers.some((marker: any) => {
      const id = marker.options.title;
      return id && isIdActive(id);
    });

    // If filtered state is active and no marker in this cluster is active, reduce opacity
    const isClusterOpacityReduced = isFilteredState && !hasActiveMarker;
    const opacityClass = isClusterOpacityReduced ? "opacity-50" : "opacity-100";

    return L.divIcon({
      html: `<span class="flex items-center justify-center w-full h-full bg-[#960000] text-white rounded-full font-bold border-2 border-white shadow-md text-sm ${opacityClass}">+${cluster.getChildCount()}</span>`,
      className: "custom-cluster-icon bg-transparent",
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <MapController properties={properties} autoFocus={autoFocus} />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {validProperties.map((property, index) => {
            const isActive = isIdActive(property.id);
            const isOpacityReduced = !isActive;

            return (
              <PropertyMarker
                key={property.id}
                property={property}
                autoOpen={autoFocus && property.id === properties[0]?.id}
                opacity={isOpacityReduced ? 0.5 : 1}
                onClick={() => setClickedId(property.id)}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

function PropertyMarker({ property, autoOpen, opacity = 1, onClick }: { property: RealEstate, autoOpen: boolean, opacity?: number, onClick?: () => void }) {
  const markerRef = useRef<L.Marker>(null);

  // Custom Icon definition locally or passed down if expensive to recreate
  const customIcon = L.divIcon({
    className: "bg-transparent",
    html: `
      <svg viewBox="0 0 24 24" width="40" height="40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); display: block; overflow: visible;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#960000" stroke="#960000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
        <circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    if (autoOpen && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [autoOpen, property]);

  const position: [number, number] = [property.address_lat!, property.address_lng!];

  return (
    <Marker
      position={position}
      icon={customIcon}
      ref={markerRef}
      opacity={opacity}
      title={property.id} // Important: used for cluster logic
      eventHandlers={{
        click: () => {
          onClick?.();
        }
      }}
    >
      <Popup>
        <div className="flex flex-col gap-2 min-w-[200px]">
          <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-100">
            {property.images?.[0]?.url && (
              <img
                src={property.images[0].url}
                alt={property.code}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">{property.code}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{property.address_street}, {property.address_number}</p>
            <div className="mt-2 font-semibold text-[#960000]">
              {property.sale_price ? `R$ ${property.sale_price.toLocaleString("pt-BR")}` : "Preço sob consulta"}
            </div>
            <Link
              href={`/imoveis/${property.code}`}
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
