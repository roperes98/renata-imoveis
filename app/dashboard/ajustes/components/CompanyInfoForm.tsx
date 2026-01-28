"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsService } from "@/app/lib/services/mock-settings-service";
import { CompanySettings } from "@/app/lib/types/settings";
import { useToast } from "@/components/ui/toast-context";
import { Loader2 } from "lucide-react";

export function CompanyInfoForm() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast({
        title: "Sucesso",
        description: "Informações salvas com sucesso!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>
          Configure os dados principais da empresa e redes sociais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="creci">CRECI</Label>
              <Input
                id="creci"
                value={settings.creci}
                onChange={(e) => setSettings({ ...settings, creci: e.target.value })}
                placeholder="Ex: 12345-J"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor Primária (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  value={settings.primaryColor || ""}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  placeholder="#000000"
                />
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: settings.primaryColor || "#000000" }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Redes Sociais</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram (usuário)</Label>
                <Input
                  id="instagram"
                  value={settings.socials?.instagram || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, instagram: e.target.value },
                    })
                  }
                  placeholder="@usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook (URL)</Label>
                <Input
                  id="facebook"
                  value={settings.socials?.facebook || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.socials?.email || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, email: e.target.value },
                    })
                  }
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">Youtube (URL)</Label>
                <Input
                  id="youtube"
                  value={settings.socials?.youtube || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn (URL)</Label>
                <Input
                  id="linkedin"
                  value={settings.socials?.linkedin || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (somente números)</Label>
                <Input
                  id="whatsapp"
                  value={settings.socials?.whatsapp || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socials: { ...settings.socials, whatsapp: e.target.value },
                    })
                  }
                  placeholder="5521999999999"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
