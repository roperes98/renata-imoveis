"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Imports from new components
import { OwnerForm } from "@/app/components/dashboard/authorization-form/OwnerForm";
import { DocumentUpload } from "@/app/components/dashboard/authorization-form/DocumentUpload";
import { TermsAccordion } from "@/app/components/dashboard/authorization-form/TermsAccordion";
import { OwnerData } from "@/app/components/dashboard/authorization-form/types";
import { validateCPF } from "@/app/components/dashboard/authorization-form/utils";

interface AuthorizationFormProps {
  propertyId: string;
  token: string;
  userEmail?: string;
}

const createEmptyOwner = (email: string = ""): OwnerData => ({
  name: "",
  email: email,
  phone: "",
  cellphone: "",
  rg: "",
  rg_issued_at: "",
  cpf: "",
  nationality: "Brasileira",
  profession: "",
  marital_status: "",
});

export default function AuthorizationForm({ propertyId, token, userEmail }: AuthorizationFormProps) {
  const [owners, setOwners] = useState<OwnerData[]>([createEmptyOwner(userEmail)]);
  const [currentOwnerIndex, setCurrentOwnerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneCountries, setPhoneCountries] = useState<{ [key: number]: { phone: Country | undefined; cellphone: Country | undefined } }>({});

  // Estados para upload de documentos
  const [documents, setDocuments] = useState<{
    onusReais: { file: File | null; url: string | null; uploading: boolean; previewUrl?: string | null };
    iptu: { file: File | null; url: string | null; uploading: boolean; previewUrl?: string | null };
    condominio: { file: File | null; url: string | null; uploading: boolean; previewUrl?: string | null };
  }>({
    onusReais: { file: null, url: null, uploading: false, previewUrl: null },
    iptu: { file: null, url: null, uploading: false, previewUrl: null },
    condominio: { file: null, url: null, uploading: false, previewUrl: null },
  });

  const [draggingDoc, setDraggingDoc] = useState<string | null>(null);

  const generatePdfPreview = async (file: File): Promise<string | null> => {
    try {
      // Dynamic import para reduzir bundle size
      const pdfjsLib = await import('pdfjs-dist');

      // Configurar worker usando o arquivo copiado para a pasta public
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduzir logs
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise;
      const page = await pdf.getPage(1); // Primeira página

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Erro ao gerar prévia do PDF:', error);
      return null;
    }
  };

  const handleFileUpload = async (docType: 'onusReais' | 'iptu' | 'condominio', file: File) => {
    // Validar tamanho do arquivo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("O arquivo excede o limite máximo de 5MB.");
      return;
    }

    // Atualizar estado para mostrar loading
    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true }
    }));

    try {
      // TODO: Implementar upload real para o servidor
      // Por enquanto, simula o upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Criar URL temporária para preview
      const url = URL.createObjectURL(file);

      // Se for PDF, gerar prévia da primeira página
      let previewUrl: string | null = null;
      if (/\.pdf$/i.test(file.name)) {
        previewUrl = await generatePdfPreview(file);
      } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
        // Para imagens, usar a própria URL
        previewUrl = url;
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: { file, url, uploading: false, previewUrl }
      }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do arquivo. Tente novamente.");
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }));
    }
  };

  const handleRemoveFile = (docType: 'onusReais' | 'iptu' | 'condominio') => {
    if (documents[docType].url) {
      URL.revokeObjectURL(documents[docType].url!);
    }
    if (documents[docType].previewUrl && documents[docType].previewUrl !== documents[docType].url) {
      // Se a previewUrl for diferente da url (PDF), revogar também
      if (documents[docType].previewUrl.startsWith('blob:') || documents[docType].previewUrl.startsWith('data:')) {
        // Para data URLs não precisa revogar, mas para blob URLs sim
        if (documents[docType].previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(documents[docType].previewUrl);
        }
      }
    }
    setDocuments(prev => ({
      ...prev,
      [docType]: { file: null, url: null, uploading: false, previewUrl: null }
    }));
  };

  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!documents[docType as keyof typeof documents].url && !documents[docType as keyof typeof documents].uploading) {
      setDraggingDoc(docType);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingDoc(null);
  };

  const handleDrop = (e: React.DragEvent, docType: 'onusReais' | 'iptu' | 'condominio') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingDoc(null);

    const file = e.dataTransfer.files?.[0];
    if (file && !documents[docType].url && !documents[docType].uploading) {
      handleFileUpload(docType, file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'onusReais' | 'iptu' | 'condominio') => {
    const file = e.target.files?.[0];
    if (file && !documents[docType].url && !documents[docType].uploading) {
      handleFileUpload(docType, file);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Manter referência das URLs para limpeza na desmontagem
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    urlsRef.current = [
      documents.onusReais.url,
      documents.iptu.url,
      documents.condominio.url
    ].filter(Boolean) as string[];
  }, [documents.onusReais.url, documents.iptu.url, documents.condominio.url]);

  // Limpar URLs ao desmontar o componente
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const addOwner = () => {
    setOwners((prev) => [...prev, createEmptyOwner()]);
    setCurrentOwnerIndex(owners.length); // Define o novo proprietário como ativo
  };

  const removeOwner = (index: number) => {
    if (owners.length <= 1) {
      return; // Não permitir remover o último proprietário
    }
    setOwners((prev) => prev.filter((_, i) => i !== index));
    // Limpar países do proprietário removido
    setPhoneCountries((prev) => {
      const newCountries = { ...prev };
      delete newCountries[index];
      // Reindexar países para os índices restantes
      const reindexed: typeof phoneCountries = {};
      Object.keys(newCountries).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newCountries[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newCountries[oldIndex];
        }
      });
      return reindexed;
    });
    // Ajustar o índice ativo se necessário
    if (currentOwnerIndex >= owners.length - 1) {
      setCurrentOwnerIndex(Math.max(0, owners.length - 2));
    } else if (currentOwnerIndex > index) {
      setCurrentOwnerIndex(currentOwnerIndex - 1);
    }
  };

  const updateOwner = (index: number, field: keyof OwnerData, value: string) => {
    setOwners((prev) =>
      prev.map((owner, i) => (i === index ? { ...owner, [field]: value } : owner))
    );
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateOwner(index, name as keyof OwnerData, value);
  };

  const handleSelectChange = (index: number, name: string, value: string) => {
    updateOwner(index, name as keyof OwnerData, value);
  };

  // Format CPF
  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, "").substring(0, 11);
    if (v.length === 0) return "";
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.substring(0, 3)}.${v.substring(3)}`;
    if (v.length <= 9) return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
    return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
  };

  // Format RG
  const formatRG = (value: string) => {
    const v = value.replace(/\D/g, "").substring(0, 9);
    if (v.length === 0) return "";
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.substring(0, 2)}.${v.substring(2)}`;
    if (v.length <= 8) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
    return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}-${v.substring(8)}`;
  };

  const handleCPFChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);

    // Validar CPF quando estiver completo (14 caracteres: 000.000.000-00)
    // Se estiver vazio, limpa o erro
    let error: string | undefined = undefined;
    if (formatted.length === 14) {
      if (!validateCPF(formatted)) {
        error = "CPF inválido";
      }
    }

    setOwners((prev) =>
      prev.map((owner, i) => (i === index ? { ...owner, cpf: formatted, cpfError: error } : owner))
    );
  };

  const handleRGChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRG(e.target.value);
    updateOwner(index, "rg", formatted);
  };

  const handlePhoneInputChange = (index: number, field: "phone" | "cellphone", value: string | undefined) => {
    updateOwner(index, field, value || "");
  };

  const handlePhoneCountryChange = (index: number, field: "phone" | "cellphone", country: Country | undefined) => {
    setPhoneCountries(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: country
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se há erros de validação antes de enviar
    const hasErrors = owners.some(owner => owner.cpfError);
    if (hasErrors) {
      alert("Por favor, corrija os erros no formulário antes de enviar.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar a lógica de envio do formulário
      // Por enquanto, apenas simula o envio
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Owners data:", owners);
      console.log("Property ID:", propertyId);
      console.log("Token:", token);
      console.log("Documents:", {
        onusReais: documents.onusReais.file?.name,
        iptu: documents.iptu.file?.name,
        condominio: documents.condominio.file?.name,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Formulário Enviado com Sucesso!
            </h3>
            <p className="text-gray-600">
              Sua autorização foi registrada. Em breve entraremos em contato.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Autorização de venda</CardTitle>
            <CardDescription>
              Preencha todas as informações solicitadas para completar a autorização
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addOwner}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Proprietário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {owners.map((owner, index) => (
            <div key={index} className={index > 0 ? "border-t border-gray-200 pt-6" : ""}>
              <OwnerForm
                owner={owner}
                index={index}
                isActive={index === currentOwnerIndex}
                totalOwners={owners.length}
                phoneCountry={phoneCountries[index] || { phone: undefined, cellphone: undefined }}
                onEdit={setCurrentOwnerIndex}
                onRemove={removeOwner}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onPhoneChange={handlePhoneInputChange}
                onPhoneCountryChange={handlePhoneCountryChange}
                onCpfChange={handleCPFChange}
                onRgChange={handleRGChange}
              />
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ônus Reais ou Escritura */}
            <DocumentUpload
              title="Ônus reais ou escritura"
              docType="onusReais"
              file={documents.onusReais.file}
              url={documents.onusReais.url}
              previewUrl={documents.onusReais.previewUrl}
              uploading={documents.onusReais.uploading}
              dragging={draggingDoc === 'onusReais'}
              onDragOver={(e) => handleDragOver(e, 'onusReais')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'onusReais')}
              onFileSelect={(e) => handleFileInputChange(e, 'onusReais')}
              onRemove={() => handleRemoveFile('onusReais')}
            />

            {/* IPTU */}
            <DocumentUpload
              title="IPTU"
              docType="iptu"
              file={documents.iptu.file}
              url={documents.iptu.url}
              previewUrl={documents.iptu.previewUrl}
              uploading={documents.iptu.uploading}
              dragging={draggingDoc === 'iptu'}
              onDragOver={(e) => handleDragOver(e, 'iptu')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'iptu')}
              onFileSelect={(e) => handleFileInputChange(e, 'iptu')}
              onRemove={() => handleRemoveFile('iptu')}
            />

            {/* Boleto do Condomínio */}
            <DocumentUpload
              title="Boleto do condomínio"
              docType="condominio"
              file={documents.condominio.file}
              url={documents.condominio.url}
              previewUrl={documents.condominio.previewUrl}
              uploading={documents.condominio.uploading}
              dragging={draggingDoc === 'condominio'}
              onDragOver={(e) => handleDragOver(e, 'condominio')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'condominio')}
              onFileSelect={(e) => handleFileInputChange(e, 'condominio')}
              onRemove={() => handleRemoveFile('condominio')}
            />
          </div>

          <TermsAccordion />

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? "Enviando..." : "Enviar Autorização"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
