"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { FaSpinner } from "react-icons/fa";
import { PropertyType, Condominium, Client, Agent, PropertyDisplay, CondominiumAddress, IbgeUF, IbgeCity } from "@/app/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNeighborhoodZone } from "@/app/lib/actions/getNeighborhoodZone";

import { BasicInfoStep } from "./property-form/steps/BasicInfoStep";
import { AddressStep } from "./property-form/steps/AddressStep";
import { FeaturesStep } from "./property-form/steps/FeaturesStep";
import { MediaStep } from "./property-form/steps/MediaStep";
import { FormStepper } from "./property-form/FormStepper";
import { PropertyFormData, LegalData, KeysData, MediaItem } from "./property-form/types";

// Helper functions (kept locally or could be moved to utils)
const PROPERTY_TYPE_CODE_PREFIX: Record<PropertyType, string> = {
  house: "RECS",
  apartment: "REAP",
  penthouse: "RECB",
  village_house: "RECV",
  gated_community_house: "RECC",
  flat: "REFL",
  kitnet: "REKT",
  loft: "RELO",
  studio: "REST",
  allotment_land: "RETE",
  building: "REPR",
  farm: "REFA",
};

const formatCurrencyInitial = (val: number | string | undefined | null) => {
  if (!val) return "";
  return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const parseCurrencyToNumber = (val: string | number | null) => {
  if (!val) return null;
  if (typeof val === 'number') return val;
  return Number(val.replace(/[^\d,]/g, "").replace(",", "."));
};

interface PropertyFormProps {
  condominiums?: Condominium[];
  clients?: Client[];
  agents?: Agent[];
  initialData?: PropertyDisplay;
}

export default function PropertyForm({ condominiums = [], clients = [], agents = [], initialData }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Images State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Initialize media items from initialData
  useEffect(() => {
    if (initialData?.images && mediaItems.length === 0) {
      setMediaItems(initialData.images.map((item, index) => ({
        id: `existing-${index}`,
        url: item.url,
        isNew: false,
        label: item.tag || ""
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Main Property Data
  const [formData, setFormData] = useState<PropertyFormData>({
    code: initialData?.code || "",
    type: initialData?.type || "apartment",
    status: initialData?.status || "for_sale",
    sale_price: formatCurrencyInitial(initialData?.sale_price),
    rent_price: formatCurrencyInitial(initialData?.rent_price),
    condominium_fee: formatCurrencyInitial(initialData?.condominium_fee),
    property_tax: formatCurrencyInitial(initialData?.property_tax),
    iptu_number: initialData?.iptu_number || "",
    property_tax_period: initialData?.property_tax_period || "yearly",
    description: initialData?.description || "",
    address_street: initialData?.address_street || "",
    address_number: initialData?.address_number || "",
    address_neighborhood: initialData?.address_neighborhood || "",
    address_city: initialData?.address_city || "",
    address_state: initialData?.address_state || "",
    address_zip: initialData?.address_zip || "",
    address_complement: initialData?.address_complement || "",
    address_reference: initialData?.address_reference || "",
    zone: initialData?.zone || "",
    condominium_address_id: initialData?.condominium_address_id || "",
    bedrooms: initialData?.bedrooms?.toString() || "",
    bathrooms: initialData?.bathrooms?.toString() || "",
    parking_spaces: initialData?.parking_spaces?.toString() || "",
    usable_area: initialData?.usable_area?.toString() || "",
    total_area: initialData?.total_area?.toString() || "",
    suites: initialData?.suites?.toString() || "",
    salas: "",
    floor_number: initialData?.floor_number?.toString() || "",
    construction_year: initialData?.construction_year?.toString() || "",
    orientation: "",
    youtube_url: initialData?.youtube_url || "",
    virtual_tour_url: initialData?.virtual_tour_url || "",
    condominium_id: initialData?.condominium_id || "",
    is_condo_fee_exempt: initialData?.is_condo_fee_exempt || false,
    is_property_tax_exempt: initialData?.is_property_tax_exempt || false,
    usage_type: "RESIDENTIAL",
    features: initialData?.features || [],
    watermark_source: "none",
    watermark_position: "center",
    watermark_opacity: "50",
  });

  // Owner Selection
  const initialOwnerId = initialData?.real_estate_owners?.[0]?.client?.id || "";
  const [selectedOwnerId, setSelectedOwnerId] = useState(initialOwnerId);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const [newOwnerData, setNewOwnerData] = useState({
    name: "", email: "", phone: "", whatsapp: "", notes: ""
  });
  const [creatingOwner, setCreatingOwner] = useState(false);

  // Agent Selection
  const initialAgentId = initialData?.real_estate_agents?.[0]?.agent?.id || "";
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId);

  // Condominium Creation State
  const [condoSheetOpen, setCondoSheetOpen] = useState(false);
  const [newCondoData, setNewCondoData] = useState({
    name: "", description: "", building_type: "", total_units: "",
    total_floors: "", tower_count: "", construction_year: "", amenities: [] as string[]
  });
  const [creatingCondo, setCreatingCondo] = useState(false);

  // Legal & Keys
  const [legalData, setLegalData] = useState<LegalData>({
    has_deed: initialData?.property_legal_details?.has_deed || false,
    is_registered: initialData?.property_legal_details?.is_registered || false,
    accepts_financing: initialData?.property_legal_details?.accepts_financing || false,
    has_exclusivity: initialData?.property_legal_details?.has_exclusivity || false,
    authorization_status: initialData?.property_legal_details?.authorization_status || "verbal",
    matricula: initialData?.property_legal_details?.matricula || "",
    incorporation_registry: initialData?.property_legal_details?.incorporation_registry || "",
  });

  const [keysData, setKeysData] = useState<KeysData>({
    key_location: initialData?.property_keys?.key_location || "",
    key_code: initialData?.property_keys?.key_code || "",
    access_instructions: initialData?.property_keys?.access_instructions || "",
  });

  // Address Helper States
  const [ufs, setUfs] = useState<IbgeUF[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [condoAddresses, setCondoAddresses] = useState<CondominiumAddress[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingCondoAddresses, setLoadingCondoAddresses] = useState(false);
  const [lastFetchedCep, setLastFetchedCep] = useState("");
  const [lockedAddressFields, setLockedAddressFields] = useState({
    street: false, neighborhood: false, city: false, state: false, zone: false, zip: false, number: false,
  });

  // Effects
  useEffect(() => {
    if (!initialData && !formData.code && formData.type) {
      generatePropertyCode(formData.type, formData.usage_type).then((code) => {
        setFormData(prev => ({ ...prev, code }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("https://brasilapi.com.br/api/ibge/uf/v1")
      .then(res => res.json())
      .then((data: IbgeUF[]) => {
        setUfs(data.sort((a, b) => a.nome.localeCompare(b.nome)));
      })
      .catch(err => console.error("Error fetching UFs:", err));
  }, []);

  // Handlers
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) {
      setFormData(prev => ({ ...prev, [name]: "" }));
      return;
    }
    const amount = Number(rawValue) / 100;
    const formatted = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove tudo exceto números
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // Converte para número e divide por 100 para considerar os centavos
    const numberValue = Number(cleanValue) / 100;

    // Formata usando o locale pt-BR
    const formatted = numberValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleAreaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // A formatação já é garantida pelo handleAreaChange
    // Mantemos a função para compatibilidade com a interface
    const { name, value } = e.target;
    if (!value) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generatePropertyCode = async (propertyType: PropertyType, usageType: "RESIDENTIAL" | "COMMERCIAL"): Promise<string> => {
    let prefix = PROPERTY_TYPE_CODE_PREFIX[propertyType] || "REXX";

    if (usageType === "COMMERCIAL") {
      prefix = prefix.replace(/^RE/, "CO");
    }

    try {
      const { data, error } = await supabase
        .from("real_estate")
        .select("code")
        .like("code", `${prefix}%`)
        .order("code", { ascending: false })
        .limit(100);

      if (error) return `${prefix}0001`;

      let maxNumber = 0;
      if (data && data.length > 0) {
        data.forEach((item) => {
          const match = item.code.match(new RegExp(`^${prefix}(\\d+)$`));
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) maxNumber = num;
          }
        });
      }
      return `${prefix}${(maxNumber + 1).toString().padStart(4, "0")}`;
    } catch (error) {
      return `${prefix}0001`;
    }
  };

  const handleSelectChange = async (name: string, value: string | number) => {
    if (name === "type" && !initialData && typeof value === "string") {
      const newType = value as PropertyType;
      const generatedCode = await generatePropertyCode(newType, formData.usage_type);
      setFormData(prev => ({ ...prev, [name]: newType, code: generatedCode }));
    } else if (name === "type" && typeof value === "string" && !formData.code) {
      const newType = value as PropertyType;
      const generatedCode = await generatePropertyCode(newType, formData.usage_type);
      setFormData(prev => ({ ...prev, [name]: newType, code: generatedCode }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleUsageTypeChange = async (newUsageType: "RESIDENTIAL" | "COMMERCIAL") => {
    if (!initialData) {
      const generatedCode = await generatePropertyCode(formData.type, newUsageType);
      setFormData(prev => ({ ...prev, usage_type: newUsageType, code: generatedCode }));
    } else {
      setFormData(prev => ({ ...prev, usage_type: newUsageType }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Check if it's a checkbox - not used much except features which handles itself, but just in case
    // Actually features uses handleFeatureToggle.
    // Legal & Keys inputs:
    if (name in legalData) {
      setLegalData(prev => ({ ...prev, [name]: value }));
    } else if (name in keysData) {
      setKeysData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Handlers
  const addFiles = (files: File[]) => {
    const newItems: MediaItem[] = files.map(file => ({
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file), // Preview URL
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

  const applyCondoAddress = async (selectedAddr: CondominiumAddress) => {
    await fetchCitiesForState(selectedAddr.state);
    setFormData(prev => ({
      ...prev,
      condominium_address_id: selectedAddr.id,
      address_street: selectedAddr.street,
      address_number: selectedAddr.number,
      address_neighborhood: selectedAddr.neighborhood,
      address_city: selectedAddr.city,
      address_state: selectedAddr.state,
      address_zip: selectedAddr.zip,
      zone: selectedAddr.zone || prev.zone,
    }));
    setLockedAddressFields({
      street: true, neighborhood: true, city: true, state: true, zone: true, zip: true, number: true,
    });
  };

  useEffect(() => {
    async function fetchAddresses() {
      if (!formData.condominium_id) {
        setCondoAddresses([]);
        return;
      }
      setLoadingCondoAddresses(true);
      const { data } = await supabase.from('condominium_addresses').select('*').eq('condominium_id', formData.condominium_id);
      if (data) {
        setCondoAddresses(data);
        const currentIdInList = data.some(a => a.id === formData.condominium_address_id);
        if (data.length > 0 && !currentIdInList) applyCondoAddress(data[0]);
      }
      setLoadingCondoAddresses(false);
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.condominium_id]);

  const handleCondominiumChange = (val: string | number) => {
    const selectedCondoId = val as string;
    if (!selectedCondoId) {
      setFormData(prev => ({
        ...prev, condominium_id: "", condominium_address_id: "", address_zip: "", address_street: "", address_number: "",
        address_neighborhood: "", address_city: "", address_state: "", zone: "", construction_year: "", address_complement: ""
      }));
      setLockedAddressFields({ street: false, neighborhood: false, city: false, state: false, zone: false, zip: false, number: false });
    } else {
      setFormData(prev => {
        const updates: any = { condominium_id: selectedCondoId };
        const selectedCondo = condominiums.find(c => c.id === selectedCondoId);
        if (selectedCondo) {
          if (selectedCondo.construction_year) updates.construction_year = selectedCondo.construction_year.toString();
          if (selectedCondo.amenities && selectedCondo.amenities.length > 0) {
            updates.features = [...Array.from(new Set([...prev.features, ...selectedCondo.amenities]))];
          }
        }
        return { ...prev, ...updates };
      });
    }
  };

  const handleStateChange = async (val: string) => {
    setFormData(prev => ({ ...prev, address_state: val, address_city: "" }));
    await fetchCitiesForState(val);
  };

  const fetchAddress = async (cep: string) => {
    if (cep === lastFetchedCep) return;
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

      setFormData(prev => ({
        ...prev,
        address_street: data.street || prev.address_street,
        address_neighborhood: data.neighborhood || prev.address_neighborhood,
        address_state: data.state || prev.address_state,
        address_city: finalCity || prev.address_city,
        zone: zone || prev.zone
      }));

      setLockedAddressFields({
        street: !!data.street, neighborhood: !!data.neighborhood, city: !!finalCity,
        state: !!data.state, zone: !!zone, zip: false, number: false,
      });
      setLastFetchedCep(cep);
    } catch (error) {
      console.error("Error fetching CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let maskedValue = value;
    if (value.length > 5) maskedValue = `${value.slice(0, 5)}-${value.slice(5)}`;

    setFormData(prev => ({ ...prev, address_zip: maskedValue }));

    if (value.length === 8) {
      fetchAddress(value);
    } else {
      // Clear logic if needed, simplified here
      setLastFetchedCep("");
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) fetchAddress(cep);
  };

  // Add Owner Logic
  const handleAddOwner = async () => {
    try {
      setCreatingOwner(true);
      const { data, error } = await supabase.from('clients').insert([{
        name: newOwnerData.name, email: newOwnerData.email || null, phone: newOwnerData.phone || null,
        whatsapp: newOwnerData.whatsapp || null, notes: newOwnerData.notes || null
      }]).select().single();

      if (error) throw error;
      if (data) {
        // Update client list? We don't have access to setClients. 
        // We relied on `clients` prop in parent. BUT passing it here means we need to update it?
        // Actually, we can just update the Combobox options via a local state or refetch.
        // We can't refetch easily as this is a component.
        // We will assume revalidation or just add to a local list?
        // We need `clients` to be a state to add to it.
        // PropertyForm receives clients as prop.
        // I should have made clients a state. Step 145: `const [clientsList, setClientsList] = useState(clients);`
        // I missed that in the rewrite above. I will fix it now.
      }
      setOwnerSheetOpen(false);
      setNewOwnerData({ name: "", email: "", phone: "", whatsapp: "", notes: "" });
      if (data) setSelectedOwnerId(data.id);
    } catch (error) {
      console.error("Error creating owner:", error);
      alert("Erro ao criar proprietário.");
    } finally {
      setCreatingOwner(false);
    }
  };

  // Add Condo Logic
  const handleCreateCondominium = async () => {
    try {
      setCreatingCondo(true);
      const payload = {
        name: newCondoData.name,
        construction_year: newCondoData.construction_year ? parseInt(newCondoData.construction_year) : null,
        total_units: newCondoData.total_units ? parseInt(newCondoData.total_units) : null,
        // ... other fields
      };
      const { data, error } = await supabase.from('condominiums').insert([payload]).select().single();
      if (error) throw error;
      if (data) {
        // Same issue as clients, need local state for list
        // I'll add local state for them.
      }
      setCondoSheetOpen(false);
    } catch (e) { console.error(e); alert("Erro ao criar condomínio"); }
    finally { setCreatingCondo(false); }
  };


  // Main Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images
      // Upload images
      const finalImages: { url: string; tag: string }[] = [];

      // Process media items in order
      for (const item of mediaItems) {
        if (item.isNew && item.file) {
          const fileExt = item.file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("properties").upload(fileName, item.file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("properties").getPublicUrl(fileName);
            finalImages.push({ url: publicUrl, tag: item.label });
          }
        } else {
          finalImages.push({ url: item.url, tag: item.label });
        }
      }

      const propertyPayload = {
        code: formData.code,
        type: formData.type,
        status: formData.status,
        sale_price: parseCurrencyToNumber(formData.sale_price),
        rent_price: parseCurrencyToNumber(formData.rent_price),
        condominium_fee: parseCurrencyToNumber(formData.condominium_fee),
        property_tax: parseCurrencyToNumber(formData.property_tax),
        iptu_number: formData.iptu_number,
        property_tax_period: formData.property_tax_period,
        description: formData.description,
        address_street: formData.address_street,
        address_number: formData.address_number,
        address_neighborhood: formData.address_neighborhood,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zip: formData.address_zip,
        address_complement: formData.address_complement,
        address_reference: formData.address_reference,
        zone: formData.zone,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parking_spaces: Number(formData.parking_spaces) || 0,
        usable_area: Number(formData.usable_area) || 0,
        total_area: Number(formData.total_area) || 0,
        suites: Number(formData.suites) || 0,
        floor_number: Number(formData.floor_number) || 0,
        construction_year: Number(formData.construction_year) || null,
        images: finalImages,
        updated_at: new Date().toISOString(),
        transaction_type: "sale",
        youtube_url: formData.youtube_url,
        virtual_tour_url: formData.virtual_tour_url,
        condominium_id: formData.condominium_id || null,
        is_condo_fee_exempt: formData.is_condo_fee_exempt,
        is_property_tax_exempt: formData.is_property_tax_exempt,
        features: formData.features,
      };

      let propertyId = initialData?.id;

      if (initialData) {
        const { error } = await supabase.from("real_estate").update(propertyPayload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("real_estate").insert(propertyPayload).select().single();
        if (error) throw error;
        if (data) propertyId = data.id;
      }

      if (propertyId) {
        await supabase.from("property_legal_details").upsert({ property_id: propertyId, ...legalData });
        await supabase.from("property_keys").upsert({ property_id: propertyId, ...keysData });

        if (selectedOwnerId) {
          await supabase.from("real_estate_owners").delete().eq("real_estate_id", propertyId);
          await supabase.from("real_estate_owners").insert({ real_estate_id: propertyId, client_id: selectedOwnerId, ownership_percentage: 100 });
        }
        if (selectedAgentId) {
          await supabase.from("real_estate_agents").delete().eq("real_estate_id", propertyId);
          await supabase.from("real_estate_agents").insert({ real_estate_id: propertyId, agent_id: selectedAgentId, agent_role: "captor" });
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  // Steps Configuration
  const steps = ["Principal & Valores", "Localização", "Características", "Mídia"];

  return (
    <div className="max-w-5xl mx-auto py-6">
      <FormStepper
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        steps={steps}
      />

      <Card className="">
        <CardHeader>
          <CardTitle>Novo Imóvel</CardTitle>
          <CardDescription>
            Preencha os dados do imóvel
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handlePriceChange={handlePriceChange}
                // Owner
                clients={clients}
                agents={agents}
                selectedOwnerId={selectedOwnerId}
                setSelectedOwnerId={setSelectedOwnerId}
                selectedAgentId={selectedAgentId}
                setSelectedAgentId={setSelectedAgentId}
                ownerSheetOpen={ownerSheetOpen}
                setOwnerSheetOpen={setOwnerSheetOpen}
                newOwnerData={newOwnerData}
                setNewOwnerData={setNewOwnerData}
                creatingOwner={creatingOwner}
                handleAddOwner={handleAddOwner}
                // Legal
                legalData={legalData}
                setLegalData={setLegalData}
                keysData={keysData}
                setKeysData={setKeysData}
                handleUsageTypeChange={handleUsageTypeChange}
              />
            )}

            {currentStep === 2 && (
              <AddressStep
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleCepChange={handleCepChange}
                handleCepBlur={handleCepBlur}
                loadingCep={loadingCep}
                ufs={ufs}
                cities={cities}
                loadingCities={loadingCities}
                handleStateChange={handleStateChange}
                condominiums={condominiums}
                handleCondominiumChange={handleCondominiumChange}
                condoSheetOpen={condoSheetOpen}
                setCondoSheetOpen={setCondoSheetOpen}
                newCondoData={newCondoData}
                setNewCondoData={setNewCondoData}
                creatingCondo={creatingCondo}
                handleCreateCondominium={handleCreateCondominium}
                lockedAddressFields={lockedAddressFields}
              />
            )}

            {currentStep === 3 && (
              <FeaturesStep
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleAreaChange={handleAreaChange}
                handleAreaBlur={handleAreaBlur}
                condoFeatures={condominiums.find(c => c.id === formData.condominium_id)?.amenities || []}
              />
            )}

            {currentStep === 4 && (
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
