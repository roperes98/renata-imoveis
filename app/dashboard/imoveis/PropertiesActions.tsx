"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit, FaCalendarAlt, FaFileContract, FaExternalLinkAlt, FaFilePdf } from "react-icons/fa";
import { getPropertyDetails } from "./actions";
import jsPDF from "jspdf";

interface PropertiesActionsProps {
  propertyId: string;
  propertyCode: string;
}

export default function PropertiesActions({ propertyId, propertyCode }: PropertiesActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPDF = async () => {
    try {
      console.log("Starting PDF export...");
      setIsGeneratingPdf(true);
      const property = await getPropertyDetails(propertyId);
      console.log("Property details fetched:", property ? "Success" : "Failed");

      if (!property) {
        alert("Erro ao carregar dados do imóvel.");
        setIsGeneratingPdf(false);
        return;
      }

      // Dynamic imports
      console.log("Importing libraries...");
      const html2canvas = (await import("html2canvas")).default;
      const { createRoot } = await import("react-dom/client");
      const PropertyPdfTemplate = (await import("./PropertyPdfTemplate")).default;
      console.log("Libraries imported.");

      // Create hidden container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0px";
      document.body.appendChild(container);

      // Render template
      console.log("Rendering template...");
      const root = createRoot(container);

      await new Promise<void>((resolve) => {
        root.render(<PropertyPdfTemplate property={property} />);
        setTimeout(resolve, 2000);
      });
      console.log("Template rendered.");

      console.log("Capturing canvas...");
      const canvas = await html2canvas(container.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200
      });
      console.log("Canvas captured.");

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Create PDF
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Calculate position to show next chunk
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`imovel-${property.code}.pdf`);
      console.log("PDF saved.");

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      setIsOpen(false);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erro ao gerar PDF: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <BsThreeDots className="text-lg" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1 action-menu">
          <Link
            href={`/dashboard/edit/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaEdit className="mr-3" /> Editar
          </Link>
          <Link
            href={`/dashboard/visits/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaCalendarAlt className="mr-3" /> Visitas
          </Link>
          <Link
            href={`/dashboard/proposals/${propertyId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaFileContract className="mr-3" /> Propostas
          </Link>
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPdf}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000] disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#960000]"></span>
            ) : (
              <FaFilePdf className="mr-3" />
            )}
            Exportar PDF
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <Link
            href={`/imoveis/${propertyCode}`}
            target="_blank"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#960000]"
            onClick={() => setIsOpen(false)}
          >
            <FaExternalLinkAlt className="mr-3" /> Ver no Site
          </Link>
        </div>
      )}
    </div>
  );
}
