"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { Condominium, CondominiumAddress, IbgeUF, IbgeCity } from "@/app/lib/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNeighborhoodZone } from "@/app/lib/actions/getNeighborhoodZone";
import { applyWatermark, WatermarkConfig } from "@/app/lib/actions/applyWatermark";

import { BasicInfoStep } from "./condominium-form/steps/BasicInfoStep";
import { AmenitiesStep } from "./condominium-form/steps/AmenitiesStep";
import { MediaStep } from "./condominium-form/steps/MediaStep";
import { FormStepper } from "./condominium-form/FormStepper";
import { CondominiumFormData, MediaItem, CondominiumAddressFormData } from "./condominium-form/types";

interface CondominiumFormProps {
  initialData?: Condominium & { images?: string[]; addresses?: CondominiumAddress[] };
}

export default function CondominiumForm({ initialData }: CondominiumFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Images State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Initialize media items from initialData
  useEffect(() => {
    if (initialData?.images && mediaItems.length === 0) {
      setMediaItems(initialData.images.map((url, index) => ({
        id: `existing-${index}`,
        url,
        isNew: false,
        label: ""
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Main Condominium Data
  const [formData, setFormData] = useState<CondominiumFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    building_type: initialData?.building_type || "",
    total_units: initialData?.total_units?.toString() || "",
    total_floors: initialData?.total_floors?.toString() || "",
    tower_count: initialData?.tower_count?.toString() || "",
    construction_year: initialData?.construction_year?.toString() || "",
    amenities: initialData?.amenities || [],
    address_street: initialData?.addresses?.[0]?.street || "",
    address_number: initialData?.addresses?.[0]?.number || "",
    address_neighborhood: initialData?.addresses?.[0]?.neighborhood || "",
    address_city: initialData?.addresses?.[0]?.city || "",
    address_state: initialData?.addresses?.[0]?.state || "",
    address_zip: initialData?.addresses?.[0]?.zip || "",
    address_complement: initialData?.addresses?.[0]?.complement || "",
    zone: initialData?.addresses?.[0]?.zone || "",
    addresses: initialData?.addresses && initialData.addresses.length > 0
      ? initialData.addresses.map(addr => ({
        id: addr.id,
        label: addr.label || "",
        street: addr.street,
        number: addr.number,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        complement: addr.complement || "",
        zone: addr.zone || "",
      }))
      : [{
        label: "",
        street: initialData?.addresses?.[0]?.street || "",
        number: initialData?.addresses?.[0]?.number || "",
        neighborhood: initialData?.addresses?.[0]?.neighborhood || "",
        city: initialData?.addresses?.[0]?.city || "",
        state: initialData?.addresses?.[0]?.state || "",
        zip: initialData?.addresses?.[0]?.zip || "",
        complement: initialData?.addresses?.[0]?.complement || "",
        zone: initialData?.addresses?.[0]?.zone || "",
      }],
    youtube_url: "",
    virtual_tour_url: "",
    watermark_source: "none",
    watermark_position: "center",
    watermark_opacity: "50",
  });

  // Estado para rastrear qual endereço está sendo editado (índice no array)
  const [currentAddressIndex, setCurrentAddressIndex] = useState(0);

  // Address Helper States
  const [ufs, setUfs] = useState<IbgeUF[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [lastFetchedCep, setLastFetchedCep] = useState("");
  const [lockedAddressFields, setLockedAddressFields] = useState({
    street: false,
    neighborhood: false,
    city: false,
    state: false,
    zone: false,
    zip: false,
    number: false,
  });

  // Effects
  useEffect(() => {
    fetch("https://brasilapi.com.br/api/ibge/uf/v1")
      .then(res => res.json())
      .then((data: IbgeUF[]) => {
        setUfs(data.sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch(err => console.error("Error fetching UFs:", err));
  }, []);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  // Image Handlers
  const addFiles = (files: File[]) => {
    const newItems: MediaItem[] = files.map(file => ({
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
      label: ""
    }));
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const updateMediaItemLabel = (id: string, label: string) => {
    setMediaItems(prev => prev.map(item => item.id === id ? { ...item, label } : item));
  };

  // Address Logic
  const formatCityName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().split(' ').map(w => ['de', 'da', 'do', 'das', 'dos', 'e'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const fetchCitiesForState = async (stateSigla: string) => {
    if (!stateSigla) {
      setCities([]);
      return [];
    }
    setLoadingCities(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${stateSigla}`);
      const rawData = await res.json();
      const formattedData = rawData.map((c: any) => ({ ...c, nome: formatCityName(c.nome) }));
      setCities(formattedData);
      return formattedData;
    } catch {
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = async (val: string, addressIndex?: number) => {
    const index = addressIndex ?? currentAddressIndex;
    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      if (!newAddresses[index]) {
        newAddresses[index] = {
          label: "",
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip: "",
          complement: "",
          zone: "",
        };
      }
      newAddresses[index] = {
        ...newAddresses[index],
        state: val,
        city: "",
      };
      return {
        ...prev,
        addresses: newAddresses,
        address_state: val,
        address_city: "",
      };
    });
    await fetchCitiesForState(val);
  };

  // Função auxiliar para formatar CEP com máscara
  const formatCep = (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    }
    return digits;
  };

  const fetchAddress = async (cep: string, addressIndex?: number) => {
    if (cep === lastFetchedCep) return;
    const index = addressIndex ?? currentAddressIndex;
    setLoadingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!response.ok) throw new Error("CEP not found");
      const data = await response.json();
      const zone = await getNeighborhoodZone(data.neighborhood);
      let finalCity = formatCityName(data.city);

      if (data.state) {
        const citiesData = await fetchCitiesForState(data.state);
        if (citiesData && citiesData.length > 0) {
          const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const targetCity = normalizeString(data.city);
          const foundCity = citiesData.find((c: any) => normalizeString(c.nome) === targetCity);
          if (foundCity) finalCity = foundCity.nome;
        }
      }

      // Formatar CEP com máscara
      const formattedCep = formatCep(cep);

      setFormData(prev => {
        const newAddresses = [...prev.addresses];
        if (!newAddresses[index]) {
          newAddresses[index] = {
            label: "",
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            zip: "",
            complement: "",
            zone: "",
          };
        }
        newAddresses[index] = {
          ...newAddresses[index],
          street: data.street || newAddresses[index].street,
          neighborhood: data.neighborhood || newAddresses[index].neighborhood,
          state: data.state || newAddresses[index].state,
          city: finalCity || newAddresses[index].city,
          zone: zone || newAddresses[index].zone,
          zip: formattedCep,
        };
        return {
          ...prev,
          addresses: newAddresses,
          address_street: data.street || prev.address_street,
          address_neighborhood: data.neighborhood || prev.address_neighborhood,
          address_state: data.state || prev.address_state,
          address_city: finalCity || prev.address_city,
          zone: zone || prev.zone,
          address_zip: formattedCep,
        };
      });

      setLockedAddressFields({
        street: !!data.street,
        neighborhood: !!data.neighborhood,
        city: !!finalCity,
        state: !!data.state,
        zone: !!zone,
        zip: false,
        number: false,
      });
      setLastFetchedCep(cep);
    } catch (error) {
      console.error("Error fetching CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>, addressIndex?: number) => {
    const index = addressIndex ?? currentAddressIndex;
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let maskedValue = value;
    if (value.length > 5) maskedValue = `${value.slice(0, 5)}-${value.slice(5)}`;

    const currentAddress = formData.addresses[index];
    const previousCep = currentAddress?.zip?.replace(/\D/g, "") || formData.address_zip.replace(/\D/g, "");
    const isCepReduced = previousCep.length > value.length;

    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      if (!newAddresses[index]) {
        newAddresses[index] = {
          label: "",
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip: "",
          complement: "",
          zone: "",
        };
      }
      newAddresses[index] = {
        ...newAddresses[index],
        zip: maskedValue,
      };
      return {
        ...prev,
        addresses: newAddresses,
        address_zip: maskedValue,
      };
    });

    if (value.length === 8) {
      fetchAddress(value, index);
    } else {
      setLastFetchedCep("");
      // Se o CEP foi reduzido, limpar os campos de endereço
      if (isCepReduced) {
        setFormData(prev => {
          const newAddresses = [...prev.addresses];
          if (newAddresses[index]) {
            newAddresses[index] = {
              ...newAddresses[index],
              street: "",
              neighborhood: "",
              city: "",
              state: "",
              zone: "",
            };
          }
          return {
            ...prev,
            addresses: newAddresses,
            address_street: "",
            address_neighborhood: "",
            address_city: "",
            address_state: "",
            zone: "",
          };
        });
        setLockedAddressFields({
          street: false,
          neighborhood: false,
          city: false,
          state: false,
          zone: false,
          zip: false,
          number: false,
        });
      }
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>, addressIndex?: number) => {
    const index = addressIndex ?? currentAddressIndex;
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) fetchAddress(cep, index);
  };

  // Funções para gerenciar múltiplos endereços
  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          label: "",
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip: "",
          complement: "",
          zone: "",
        },
      ],
    }));
    setCurrentAddressIndex(formData.addresses.length);
  };

  const removeAddress = (index: number) => {
    if (formData.addresses.length <= 1) {
      // Não permitir remover o último endereço
      return;
    }
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
    if (currentAddressIndex >= formData.addresses.length - 1) {
      setCurrentAddressIndex(Math.max(0, formData.addresses.length - 2));
    }
  };

  const updateAddress = (index: number, field: keyof CondominiumAddressFormData, value: string) => {
    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      if (!newAddresses[index]) {
        newAddresses[index] = {
          label: "",
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip: "",
          complement: "",
          zone: "",
        };
      }
      newAddresses[index] = {
        ...newAddresses[index],
        [field]: value,
      };
      // Atualizar também os campos de compatibilidade
      const updated = {
        ...prev,
        addresses: newAddresses,
      };
      if (index === currentAddressIndex) {
        updated.address_street = field === "street" ? value : prev.address_street;
        updated.address_number = field === "number" ? value : prev.address_number;
        updated.address_neighborhood = field === "neighborhood" ? value : prev.address_neighborhood;
        updated.address_city = field === "city" ? value : prev.address_city;
        updated.address_state = field === "state" ? value : prev.address_state;
        updated.address_zip = field === "zip" ? value : prev.address_zip;
        updated.address_complement = field === "complement" ? value : prev.address_complement;
        updated.zone = field === "zone" ? value : prev.zone;
      }
      return updated;
    });
  };

  // Main Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images (if storage bucket exists)
      // Note: The condominiums table doesn't have an images field yet
      // You may need to add it or create a separate table for condominium images
      const finalImages: string[] = [];

      // Configuração da marca d'água
      const watermarkConfig: WatermarkConfig = {
        source: formData.watermark_source as WatermarkConfig["source"],
        position: formData.watermark_position as WatermarkConfig["position"],
        opacity: formData.watermark_opacity || "50",
      };

      for (const item of mediaItems) {
        if (item.isNew && item.file) {
          try {
            // Converte o File para Buffer
            const arrayBuffer = await item.file.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);

            // Aplica marca d'água se configurada
            const processedBuffer = await applyWatermark(imageBuffer, watermarkConfig);

            // Converte o Buffer de volta para File
            const fileExt = item.file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const processedFile = new File([processedBuffer], fileName, { type: item.file.type });

            // Upload para o Supabase
            const { error: uploadError } = await supabase.storage
              .from("properties")
              .upload(`condominiums/${fileName}`, processedFile);

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from("properties")
                .getPublicUrl(`condominiums/${fileName}`);
              finalImages.push(publicUrl);
            } else {
              console.error("Error uploading image:", uploadError);
            }
          } catch (error) {
            console.error("Error processing image with watermark:", error);
            // Em caso de erro, tenta fazer upload da imagem original
            const fileExt = item.file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from("properties")
              .upload(`condominiums/${fileName}`, item.file);
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from("properties")
                .getPublicUrl(`condominiums/${fileName}`);
              finalImages.push(publicUrl);
            }
          }
        } else {
          finalImages.push(item.url);
        }
      }

      const condominiumPayload = {
        name: formData.name,
        description: formData.description || null,
        building_type: formData.building_type || null,
        total_units: formData.total_units ? parseInt(formData.total_units) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
        tower_count: formData.tower_count ? parseInt(formData.tower_count) : null,
        construction_year: formData.construction_year ? parseInt(formData.construction_year) : null,
        amenities: formData.amenities.length > 0 ? formData.amenities : null,
      };

      let condominiumId = initialData?.id;

      if (initialData) {
        const { error } = await supabase
          .from("condominiums")
          .update(condominiumPayload)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("condominiums")
          .insert(condominiumPayload)
          .select()
          .single();
        if (error) throw error;
        if (data) condominiumId = data.id;
      }

      // Save addresses
      if (condominiumId) {
        // Obter IDs dos endereços existentes
        const existingAddressIds = new Set(
          initialData?.addresses?.map(addr => addr.id).filter(Boolean) || []
        );

        // Processar cada endereço do formulário
        for (const address of formData.addresses) {
          if (address.street && address.number) {
            const addressPayload = {
              condominium_id: condominiumId,
              label: address.label || null,
              street: address.street,
              number: address.number,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              zip: address.zip,
              complement: address.complement || null,
              zone: address.zone || null,
            };

            if (address.id && existingAddressIds.has(address.id)) {
              // Atualizar endereço existente
              await supabase
                .from("condominium_addresses")
                .update(addressPayload)
                .eq("id", address.id);
              existingAddressIds.delete(address.id);
            } else {
              // Inserir novo endereço
              await supabase.from("condominium_addresses").insert([addressPayload]);
            }
          }
        }

        // Remover endereços que foram deletados (não estão mais no formulário)
        for (const addressId of existingAddressIds) {
          await supabase
            .from("condominium_addresses")
            .delete()
            .eq("id", addressId);
        }
      }

      router.push("/dashboard/condominios");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  // Steps Configuration
  const steps = ["Informações & Localização", "Amenidades", "Mídia"];

  // Configuração de títulos e descrições para cada step
  const stepConfig = {
    1: {
      title: "Informações & Localização",
      description: "Preencha as informações básicas e localização do condomínio",
    },
    2: {
      title: "Amenidades",
      description: "Configure as amenidades disponíveis no condomínio",
    },
    3: {
      title: "Mídia",
      description: "Adicione imagens e configure a marca d'água",
    },
  };

  const currentStepConfig = stepConfig[currentStep as keyof typeof stepConfig] || stepConfig[1];

  return (
    <div className="max-w-5xl mx-auto py-6">
      <FormStepper
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        steps={steps}
      />

      <Card>
        <CardHeader>
          <CardTitle>{currentStepConfig.title}</CardTitle>
          <CardDescription>
            {currentStepConfig.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleCepChange={handleCepChange}
                handleCepBlur={handleCepBlur}
                loadingCep={loadingCep}
                ufs={ufs}
                cities={cities}
                loadingCities={loadingCities}
                handleStateChange={handleStateChange}
                lockedAddressFields={lockedAddressFields}
                currentAddressIndex={currentAddressIndex}
                setCurrentAddressIndex={setCurrentAddressIndex}
                addAddress={addAddress}
                removeAddress={removeAddress}
                updateAddress={updateAddress}
              />
            )}

            {currentStep === 2 && (
              <AmenitiesStep
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {currentStep === 3 && (
              <MediaStep
                formData={formData}
                handleChange={handleChange}
                mediaItems={mediaItems}
                setMediaItems={setMediaItems}
                handleImageChange={handleImageChange}
                addFiles={addFiles}
                removeMediaItem={removeMediaItem}
                updateMediaItemLabel={updateMediaItemLabel}
              />
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

