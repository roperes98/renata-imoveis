"use client";

import React, { forwardRef } from "react";
import WideLogo from "../../components/WideLogo";
import { formatPrice, formatArea } from "../../lib/utils/format";
import { PropertyDisplay } from "../../lib/types/database";
import {
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";
import {
  IoBedOutline,
  IoCarSportOutline
} from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { TfiRulerAlt2 } from "react-icons/tfi";

interface PropertyPdfTemplateProps {
  property: PropertyDisplay;
}

const PropertyPdfTemplate = forwardRef<HTMLDivElement, PropertyPdfTemplateProps>(
  ({ property }, ref) => {
    // Determine main image or fallback
    const mainImage =
      property.images && property.images.length > 0
        ? property.images[0].url
        : "https://placehold.co/800x400?text=Sem+Imagem";

    // Define colors explicitly to avoid computed style issues (e.g. lab() from tailwind v4)
    const colors = {
      primary: "#960000",
      textDark: "#1e1e1e",
      textGray: "#6b7280", // gray-500 equivalent
      bgGray: "#f9fafb", // gray-50 equivalent
      white: "#ffffff",
      border: "#e5e7eb" // gray-200 equivalent
    };

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "Arial, sans-serif",
          width: "794px", // A4 width
          minHeight: "auto", // A4 height or auto
          backgroundColor: colors.white,
          color: colors.textDark,
          padding: "32px",
          boxSizing: "border-box",
          margin: "0 auto"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          borderBottom: `1px solid ${colors.primary}`,
          paddingBottom: "24px"
        }}>
          {/* WideLogo wrapper to ensure size without relying on unavailable style prop */}
          <div style={{ height: "64px", display: "flex", alignItems: "center" }}>
            <WideLogo className="h-16 w-auto" />
          </div>

          <div style={{ textAlign: "right", fontSize: "12px", color: colors.textGray }}>
            <p style={{ margin: 0 }}>www.renataimoveis.com.br</p>
            <p style={{ margin: 0 }}>(21) 99999-9999</p>
            <p style={{ margin: 0 }}>CRECI-RJ 7583</p>
          </div>
        </div>

        {/* Property Title & Code */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: colors.textDark, textTransform: "uppercase", margin: 0 }}>
                {property.type} em {property.address_neighborhood}
              </h1>
              <p style={{ color: colors.textGray, margin: "4px 0 0 0" }}>
                Cód: <span style={{ fontWeight: "bold", color: colors.primary }}>{property.code}</span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", color: colors.textGray, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Valor de Venda</p>
              <p style={{ fontSize: "30px", fontWeight: "800", color: colors.primary, margin: 0 }}>{formatPrice(property.sale_price)}</p>
            </div>
          </div>
          <p style={{ color: colors.textGray, fontSize: "14px", marginTop: "8px" }}>
            {property.address_street}, {property.address_number} - {property.address_city}/{property.address_state}
          </p>
        </div>

        {/* Main Image */}
        <div style={{
          marginBottom: "32px",
          width: "100%",
          height: "400px",
          overflow: "hidden",
          borderRadius: "12px",
          position: "relative"
        }}>
          <img
            src={mainImage}
            alt={property.code}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        </div>

        {/* Icons Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "32px",
          backgroundColor: colors.bgGray,
          padding: "24px",
          borderRadius: "12px",
          border: `1px solid ${colors.bgGray}` // using bg color as border or just plain
        }}>
          {/* Helper for grid items */}
          {[
            { Icon: TfiRulerAlt2, val: formatArea(property.usable_area), label: "Útil" },
            { Icon: IoBedOutline, val: property.bedrooms, label: "Quartos" },
            { Icon: PiBathtub, val: property.bathrooms, label: "Banheiros" },
            { Icon: IoCarSportOutline, val: property.parking_spaces, label: "Vagas" }
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <item.Icon style={{ fontSize: "30px", color: colors.primary, marginBottom: "8px" }} />
              <span style={{ fontSize: "18px", fontWeight: "bold", color: colors.textDark }}>{item.val}</span>
              <span style={{ fontSize: "12px", color: colors.textGray }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: colors.textDark, marginBottom: "16px", borderLeft: `4px solid ${colors.primary}`, paddingLeft: "12px" }}>
            Sobre o Imóvel
          </h2>
          <p style={{ color: "rgb(75, 85, 99)", lineHeight: "1.625", fontSize: "14px", whiteSpace: "pre-line", textAlign: "justify" }}>
            {property.description || "Sem descrição disponível."}
          </p>
        </div>

        {/* Features (limited) */}
        {property.features && property.features.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: colors.textDark, marginBottom: "16px", borderLeft: `4px solid ${colors.primary}`, paddingLeft: "12px" }}>
              Destaques
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {property.features.slice(0, 8).map((feat, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "rgb(55, 65, 81)" }}>
                  <FiCheckCircle style={{ color: colors.primary, flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "auto",
          paddingTop: "32px",
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "#9ca3af" // gray-400
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiCalendar />
            Gerado em {new Date().toLocaleDateString()}
          </div>
          <p>© {new Date().getFullYear()} Renata Imóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    );
  }
);

PropertyPdfTemplate.displayName = "PropertyPdfTemplate";

export default PropertyPdfTemplate;
