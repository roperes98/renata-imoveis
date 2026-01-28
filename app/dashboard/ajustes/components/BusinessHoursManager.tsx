"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsService } from "@/app/lib/services/mock-settings-service";
import { CompanySettings, BusinessHour } from "@/app/lib/types/settings";
import { useToast } from "@/components/ui/toast-context";
import { Loader2 } from "lucide-react";

export function BusinessHoursManager() {
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

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast({
        title: "Sucesso",
        description: "Horários salvos com sucesso!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar horários",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateDay(index: number, updates: Partial<BusinessHour>) {
    if (!settings) return;
    const newHours = [...settings.businessHours];
    newHours[index] = { ...newHours[index], ...updates };
    setSettings({ ...settings, businessHours: newHours });
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
        <CardTitle>Horário de Funcionamento</CardTitle>
        <CardDescription>
          Defina os horários de abertura e fechamento para cada dia da semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            {settings.businessHours.map((item, index) => (
              <div key={item.day} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-32 font-medium">{item.label}</div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.isOpen}
                    onCheckedChange={(checked) => updateDay(index, { isOpen: checked })}
                  />
                  <span className="text-sm text-muted-foreground w-16">
                    {item.isOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>

                {item.isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={item.openTime}
                      onChange={(e) => updateDay(index, { openTime: e.target.value })}
                      className="w-32"
                    />
                    <span>até</span>
                    <Input
                      type="time"
                      value={item.closeTime}
                      onChange={(e) => updateDay(index, { closeTime: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Horários
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
