"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Globe, Loader2, AlertCircle } from "lucide-react";
import { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Imports from new components
import { OwnerForm } from "@/app/components/dashboard/authorization-form/OwnerForm";
import { DocumentUpload } from "@/app/components/dashboard/authorization-form/DocumentUpload";
import { TermsAccordion } from "@/app/components/dashboard/authorization-form/TermsAccordion";
import { OwnerData } from "@/app/components/dashboard/authorization-form/types";
import { validateCPF } from "@/app/components/dashboard/authorization-form/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { submitAuthorization } from "@/app/actions/authorization";

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
  const [mounted, setMounted] = useState(false);
  const [owners, setOwners] = useState<OwnerData[]>([createEmptyOwner(userEmail)]);
  const [currentOwnerIndex, setCurrentOwnerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneCountries, setPhoneCountries] = useState<{ [key: number]: { phone: Country | undefined; cellphone: Country | undefined } }>({});

  // Signature State
  const [signatureData, setSignatureData] = useState<{
    ip: string;
    latitude?: number;
    longitude?: number;
    userAgent: string;
    timestamp?: string;
    locationError?: string;
  }>({
    ip: "Carregando...",
    userAgent: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestLocation = useCallback(async () => {
    console.log("Requesting location...");
    setSignatureData(prev => ({ ...prev, locationError: undefined }));

    if (typeof window === 'undefined') {
      console.log("Window is undefined, skipping geolocation");
      return;
    }

    // Detectar navegador para mensagens mais específicas (fazer antes das outras verificações)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isArc = userAgent.includes('Arc');
    const browserName = isArc ? 'Arc' : 'o navegador';

    // Verificar se está em HTTPS (requisito para geolocalização)
    // Exceções: localhost e variações são sempre permitidas (desenvolvimento local)
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.startsWith('127.0.0.1') ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.endsWith('.local');

    if (window.location.protocol !== 'https:' && !isLocalhost) {
      console.log("Not using HTTPS, geolocation may not work");
      setSignatureData(prev => ({
        ...prev,
        locationError: "A geolocalização requer uma conexão segura (HTTPS). Por favor, acesse o site via HTTPS."
      }));
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.log("Geolocation not supported");
      const browserNameForError = isArc ? 'Arc' : 'este navegador';

      setSignatureData(prev => ({
        ...prev,
        locationError: `Geolocalização não suportada por ${browserNameForError}. Tente usar Chrome, Firefox ou Edge atualizados.`
      }));
      return;
    }

    // Verificar status da permissão se a API estiver disponível
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        console.log("Permission status:", permissionStatus.state);

        if (permissionStatus.state === 'denied') {
          setSignatureData(prev => ({
            ...prev,
            locationError: `Permissão de localização negada em ${browserName}. Por favor, permita o acesso nas configurações do navegador (ícone de cadeado na barra de endereços) e tente novamente.`
          }));
          return;
        }

        // Se a permissão estiver em 'prompt', podemos continuar normalmente
        // O navegador mostrará o prompt automaticamente
      } catch {
        console.log("Permission API not fully supported, continuing anyway");
        // Alguns navegadores (como versões antigas do Arc) podem não suportar a API de Permissions
        // mas ainda suportam geolocalização, então continuamos
      }
    }

    // Função auxiliar para tentar obter localização com opções específicas
    const tryGetLocation = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    // Função auxiliar usando watchPosition como fallback (às vezes funciona melhor)
    const tryWatchLocation = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            navigator.geolocation.clearWatch(watchId);
            resolve(position);
          },
          reject,
          options
        );

        // Timeout para evitar que fique esperando indefinidamente
        setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          reject(new Error('Timeout ao usar watchPosition'));
        }, options.timeout || 15000);
      });
    };

    try {
      console.log("Calling getCurrentPosition...");

      // Primeira tentativa: com alta precisão
      try {
        const position = await tryGetLocation({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // Aceitar posição com até 1 minuto de idade
        });

        console.log("Location obtained (high accuracy):", position.coords.latitude, position.coords.longitude);
        setSignatureData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationError: undefined
        }));
        return;
      } catch (highAccuracyError: unknown) {
        console.log("High accuracy failed, trying with standard options...", highAccuracyError);

        // Segunda tentativa: sem alta precisão (mais rápido e funciona em mais dispositivos)
        try {
          const position = await tryGetLocation({
            enableHighAccuracy: false,
            timeout: 20000, // Aumentar timeout para dar mais tempo
            maximumAge: 300000 // Aceitar posição com até 5 minutos de idade
          });

          console.log("Location obtained (standard):", position.coords.latitude, position.coords.longitude);
          setSignatureData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationError: undefined
          }));
          return;
        } catch (standardError: unknown) {
          console.log("Standard options failed, trying watchPosition as fallback...", standardError);

          // Terceira tentativa: usar watchPosition (às vezes funciona quando getCurrentPosition falha)
          try {
            const position = await tryWatchLocation({
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 300000
            });

            console.log("Location obtained (watchPosition):", position.coords.latitude, position.coords.longitude);
            setSignatureData(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              locationError: undefined
            }));
            return;
          } catch {
            // Se todas falharem, usar o erro original
            throw standardError;
          }
        }
      }
    } catch (error: unknown) {
      // Robust error logging
      console.error("Geolocation error object:", error);

      let msg = "Não foi possível obter sua localização.";

      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as GeolocationPositionError;
        console.error("Geolocation error code:", geoError.code);
        console.error("Geolocation error message:", geoError.message);

        // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (geoError.code === 1) {
          msg = `Permissão de localização negada em ${browserName}.`;
          if (isArc) {
            msg += " No Arc, verifique se você bloqueou a localização neste site (ícone de cadeado/escudo na barra de URL).";
          } else {
            msg += " Clique no ícone de cadeado na barra de endereços e permita o acesso à localização.";
          }
        } else if (geoError.code === 2) {
          // POSITION_UNAVAILABLE - Comum quando o SO bloqueia o navegador
          msg = "Localização indisponível. ";

          if (isArc) {
            msg += "No Arc, isso frequentemente ocorre se o Windows/macOS não tiver dado permissão de localização para o navegador. Verifique em Configurações do Sistema > Privacidade > Localização se o Arc tem permissão.";
          } else {
            msg += "Verifique se o GPS está ativado e se o navegador tem permissão de acesso à localização nas configurações do seu sistema operacional (Windows/macOS).";
          }

          // Debug info
          if (geoError.message) msg += ` (Erro técnico: ${geoError.message})`;

        } else if (geoError.code === 3) {
          msg = "O tempo para obter a localização esgotou. Isso pode ser falha de rede ou GPS fraco. Tente novamente ou use uma conexão diferente.";
        } else if (geoError.message) {
          msg = `Erro na localização: ${geoError.message}`;
        }
      } else {
        // Erro desconhecido que não segue a interface GeolocationPositionError
        msg = "Erro desconhecido ao tentar obter localização. Tente atualizar a página.";
        console.error("Unknown error details:", error);
      }

      setSignatureData(prev => ({ ...prev, locationError: msg }));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Get User Agent
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // 2. Get IP Address
    fetch('/api/my-ip')
      .then(res => res.json())
      .then(data => {
        setSignatureData(prev => ({ ...prev, ip: data.ip, userAgent }));
      })
      .catch(err => {
        console.error("Failed to fetch IP", err);
        setSignatureData(prev => ({ ...prev, ip: "Indisponível", userAgent }));
      });

    // 3. Get Location - wait a bit to ensure component is fully mounted
    const locationTimer = setTimeout(() => {
      requestLocation();
    }, 100);

    return () => clearTimeout(locationTimer);
  }, [mounted, requestLocation]);


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

    if (!signatureData.latitude || !signatureData.ip) {
      alert("Não é possível enviar o formulário sem a confirmação de localização e IP para assinatura digital.");
      return;
    }

    setLoading(true);

    try {
      const formData = {
        propertyId,
        token,
        owners,
        documents: {
          onusReais: documents.onusReais.file ? 'Attached' : null, // Should upload to blob storage and get URL first
          iptu: documents.iptu.file ? 'Attached' : null,
          condominio: documents.condominio.file ? 'Attached' : null,
        }
      };

      const result = await submitAuthorization(formData, {
        latitude: signatureData.latitude,
        longitude: signatureData.longitude,
        userAgent: signatureData.userAgent,
        timestamp: new Date().toISOString()
      });

      console.log("Submission Result:", result);

      if (result.success) {
        setSubmitted(true);
      } else {
        alert("Erro ao enviar. Tente novamente.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Card>
        <CardContent className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

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

          <div className="border rounded-lg p-4 border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Eu li e aceito os termos e condições.<span className="text-red-500">*</span></Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="communications" />
                <Label htmlFor="communications">Eu autorizo o recebimento de comunicados e mensagens através de diferentes canais.<span className="text-red-500">*</span></Label>
              </div>
            </div>
          </div>

          {/* Signature Data Display */}
          <div className={`p-4 rounded-md border text-sm space-y-2 ${signatureData.locationError ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full animate-pulse ${signatureData.latitude ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Assinatura Eletrônica e Auditoria
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Endereço IP: <strong>{signatureData.ip}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Localização:
                  {signatureData.latitude && signatureData.longitude
                    ? <strong className="text-green-600"> {signatureData.latitude.toFixed(6)}, {signatureData.longitude.toFixed(6)}</strong>
                    : <span className="text-amber-600 italic"> {signatureData.locationError || "Aguardando permissão..."}</span>
                  }
                </span>
                {signatureData.locationError && (
                  <Button type="button" variant="outline" size="sm" onClick={requestLocation} className="ml-2 h-6 text-xs">
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </div>
            {signatureData.locationError && (
              <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>É necessário permitir a localização para assinar este documento.</span>
              </div>
            )}
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-2">
              Ao clicar em &quot;Enviar Autorização&quot;, você concorda com a captura destes dados para ins de auditoria e validação jurídica desta autorização digital.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !signatureData.latitude || !signatureData.ip}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : "Enviar Autorização"}
              </Button>
            </div>

            {(!signatureData.latitude || !signatureData.ip) && (
              <p className="text-right text-xs text-red-500">
                Aguardando dados de assinatura eletrônica (Localização e IP) para liberar o envio.
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
