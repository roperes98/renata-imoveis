"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/app/lib/services/mock-settings-service";
import { CompanySettings, CompanyAddress } from "@/app/lib/types/settings";
import { useToast } from "@/components/ui/toast-context";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";

export function AddressManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<CompanyAddress>>({
    label: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "Rio de Janeiro",
    state: "RJ",
    zip: "",
    isMain: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAddress() {
    if (!settings || !newAddress.label || !newAddress.street) return;

    setSaving(true);
    try {
      const addressToAdd: CompanyAddress = {
        id: crypto.randomUUID(),
        label: newAddress.label || "Novo Endereço",
        street: newAddress.street || "",
        number: newAddress.number || "",
        neighborhood: newAddress.neighborhood || "",
        city: newAddress.city || "",
        state: newAddress.state || "",
        zip: newAddress.zip || "",
        isMain: newAddress.isMain || settings.addresses.length === 0,
        complement: newAddress.complement,
      };

      const updatedAddresses = [...settings.addresses, addressToAdd];
      await settingsService.updateSettings({ addresses: updatedAddresses });
      setSettings({ ...settings, addresses: updatedAddresses });
      toast({
        title: "Sucesso",
        description: "Endereço adicionado com sucesso!",
        variant: "success",
      });
      setIsDialogOpen(false);
      setNewAddress({
        label: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "Rio de Janeiro",
        state: "RJ",
        zip: "",
        isMain: false,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar endereço",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!settings) return;
    const updatedAddresses = settings.addresses.filter((a) => a.id !== id);
    setSettings({ ...settings, addresses: updatedAddresses });
    await settingsService.updateSettings({ addresses: updatedAddresses });
    toast({
      title: "Sucesso",
      description: "Endereço removido.",
      variant: "default",
    });
  }

  if (loading || !settings) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Endereços</CardTitle>
          <CardDescription>Gerencie os endereços da empresa.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Endereço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Endereço</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo endereço ou filial.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome (Ex: Sede, Filial)</Label>
                  <Input
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={newAddress.zip}
                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label>Rua</Label>
                  <Input
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={newAddress.number}
                    onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={newAddress.neighborhood}
                    onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={newAddress.complement || ""}
                    onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAddress} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Endereço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{address.label}</h3>
                    {address.isMain && <Badge variant="secondary">Principal</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.street}, {address.number} {address.complement && `- ${address.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                  <p className="text-sm text-muted-foreground">{address.zip}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(address.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {settings.addresses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum endereço cadastrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
