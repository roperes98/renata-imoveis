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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsService } from "@/app/lib/services/mock-settings-service";
import { CompanySettings, BankRate, BankAccount } from "@/app/lib/types/settings";
import { useToast } from "@/components/ui/toast-context";
import { Loader2, Plus, Trash2, Landmark, CreditCard, Copy, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FinanceManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rate State
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [newRate, setNewRate] = useState<Partial<BankRate>>({
    bankName: "",
    rate: 0,
    conditions: "",
    minAge: 18,
    maxAge: 80,
    amortizationSystem: "SAC_PRICE",
    minTerm: 12,
    maxTerm: 420,
    minDownPayment: 20,
    maxIncomeCommitment: 30,
    monthlyAdminFee: 25.00,
  });

  // Account State
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bankName: "",
    agency: "",
    accountNumber: "",
    holderName: "",
    holderDocument: "",
    pixKey: "",
    accountType: "Checking",
  });

  // Commission State
  const [commissionSettings, setCommissionSettings] = useState({
    agencyPercentage: 5,
    capturerPercentage: 20,
    sellerPercentage: 20,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      if (data.commissions) {
        setCommissionSettings(data.commissions);
      }
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

  // Rate Functions
  async function handleAddRate() {
    if (!settings || !newRate.bankName) return;
    setSaving(true);
    try {
      const rateToAdd: BankRate = {
        id: crypto.randomUUID(),
        bankName: newRate.bankName || "",
        rate: Number(newRate.rate) || 0,
        conditions: newRate.conditions,
        minAge: Number(newRate.minAge),
        maxAge: Number(newRate.maxAge),
        amortizationSystem: newRate.amortizationSystem,
        minTerm: Number(newRate.minTerm),
        maxTerm: Number(newRate.maxTerm),
        minDownPayment: Number(newRate.minDownPayment),
        maxIncomeCommitment: Number(newRate.maxIncomeCommitment),
        monthlyAdminFee: Number(newRate.monthlyAdminFee),
      };
      const updatedRates = [...settings.bankRates, rateToAdd];
      await settingsService.updateSettings({ bankRates: updatedRates });
      setSettings({ ...settings, bankRates: updatedRates });
      toast({
        title: "Sucesso",
        description: "Taxa adicionada com sucesso!",
        variant: "success",
      });
      setIsRateDialogOpen(false);
      setNewRate({
        bankName: "", rate: 0, conditions: "",
        minAge: 18, maxAge: 80, amortizationSystem: "SAC_PRICE",
        minTerm: 12, maxTerm: 420, minDownPayment: 20,
        maxIncomeCommitment: 30, monthlyAdminFee: 25.00,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRate(id: string) {
    if (!settings) return;
    const updatedRates = settings.bankRates.filter((r) => r.id !== id);
    setSettings({ ...settings, bankRates: updatedRates });
    await settingsService.updateSettings({ bankRates: updatedRates });
    toast({
      title: "Sucesso",
      description: "Taxa removida.",
      variant: "default",
    });
  }

  // Account Functions
  async function handleAddAccount() {
    if (!settings || !newAccount.bankName) return;
    setSaving(true);
    try {
      const accountToAdd: BankAccount = {
        id: crypto.randomUUID(),
        bankName: newAccount.bankName || "",
        agency: newAccount.agency || "",
        accountNumber: newAccount.accountNumber || "",
        holderName: newAccount.holderName || "",
        holderDocument: newAccount.holderDocument || "",
        pixKey: newAccount.pixKey,
        accountType: (newAccount.accountType as any) || "Checking",
      };
      const updatedAccounts = [...settings.bankAccounts, accountToAdd];
      await settingsService.updateSettings({ bankAccounts: updatedAccounts });
      setSettings({ ...settings, bankAccounts: updatedAccounts });
      toast({
        title: "Sucesso",
        description: "Conta adicionada com sucesso!",
        variant: "success",
      });
      setIsAccountDialogOpen(false);
      setNewAccount({
        bankName: "",
        agency: "",
        accountNumber: "",
        holderName: "",
        holderDocument: "",
        pixKey: "",
        accountType: "Checking",
      });
    } finally {
      setSaving(false);
    }
  }

  // Commission Functions
  async function handleSaveCommissions() {
    if (!settings) return;
    setSaving(true);
    try {
      const updatedSettings = { ...settings, commissions: commissionSettings };
      await settingsService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast({
        title: "Sucesso",
        description: "Comissões salvas com sucesso!",
        variant: "success",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(id: string) {
    if (!settings) return;
    const updatedAccounts = settings.bankAccounts.filter((a) => a.id !== id);
    setSettings({ ...settings, bankAccounts: updatedAccounts });
    await settingsService.updateSettings({ bankAccounts: updatedAccounts });
    toast({
      title: "Sucesso",
      description: "Conta removida.",
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
    <div className="space-y-6">
      {/* Commission Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões</CardTitle>
          <CardDescription>
            Configure as porcentagens de comissão padrão do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Comissão da Imobiliária (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={commissionSettings.agencyPercentage}
                onChange={(e) =>
                  setCommissionSettings({
                    ...commissionSettings,
                    agencyPercentage: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem sobre o valor total da venda.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comissão do Captador (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={commissionSettings.capturerPercentage}
                onChange={(e) =>
                  setCommissionSettings({
                    ...commissionSettings,
                    capturerPercentage: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem baseada na comissão da imobiliária.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comissão do Vendedor (%)</Label>
              <Input
                type="number"
                step="0.5"
                value={commissionSettings.sellerPercentage}
                onChange={(e) =>
                  setCommissionSettings({
                    ...commissionSettings,
                    sellerPercentage: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem baseada na comissão da imobiliária.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveCommissions} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Comissões
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Rates Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Taxas de Juros</CardTitle>
            <CardDescription>Gerencie as taxas de crédito imobiliário ofertadas.</CardDescription>
          </div>
          <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nova Taxa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Taxa</DialogTitle>
                <DialogDescription>Infome os dados para simulação de crédito.</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Geral</TabsTrigger>
                  <TabsTrigger value="limits">Limites & Prazos</TabsTrigger>
                  <TabsTrigger value="fees">Custos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input
                        value={newRate.bankName}
                        onChange={(e) => setNewRate({ ...newRate, bankName: e.target.value })}
                        placeholder="Ex: Itaú"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa Anual (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newRate.rate}
                        onChange={(e) => setNewRate({ ...newRate, rate: Number(e.target.value) })}
                        placeholder="Ex: 9.5"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sistema de Amortização</Label>
                    <Select
                      value={newRate.amortizationSystem}
                      onValueChange={(val: any) => setNewRate({ ...newRate, amortizationSystem: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAC">SAC</SelectItem>
                        <SelectItem value="PRICE">Price</SelectItem>
                        <SelectItem value="SAC_PRICE">SAC + Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condições (Opcional)</Label>
                    <Input
                      value={newRate.conditions}
                      onChange={(e) => setNewRate({ ...newRate, conditions: e.target.value })}
                      placeholder="Ex: Mediante relacionamento"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Idade Mínima</Label>
                      <Input
                        type="number"
                        value={newRate.minAge}
                        onChange={(e) => setNewRate({ ...newRate, minAge: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Idade Máxima</Label>
                      <Input
                        type="number"
                        value={newRate.maxAge}
                        onChange={(e) => setNewRate({ ...newRate, maxAge: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo Mínimo (meses)</Label>
                      <Input
                        type="number"
                        value={newRate.minTerm}
                        onChange={(e) => setNewRate({ ...newRate, minTerm: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo Máximo (meses)</Label>
                      <Input
                        type="number"
                        value={newRate.maxTerm}
                        onChange={(e) => setNewRate({ ...newRate, maxTerm: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Entrada Mínima (%)</Label>
                      <Input
                        type="number"
                        value={newRate.minDownPayment}
                        onChange={(e) => setNewRate({ ...newRate, minDownPayment: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Comprometimento Máx. Renda (%)</Label>
                      <Input
                        type="number"
                        value={newRate.maxIncomeCommitment}
                        onChange={(e) => setNewRate({ ...newRate, maxIncomeCommitment: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fees" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Taxa Administrativa Mensal (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newRate.monthlyAdminFee}
                      onChange={(e) => setNewRate({ ...newRate, monthlyAdminFee: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Valor fixo cobrado mensalmente além da parcela.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button onClick={handleAddRate} disabled={saving}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settings.bankRates.map((rate) => (
              <div key={rate.id} className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{rate.bankName}</span>
                    </div>
                    {rate.amortizationSystem && (
                      <Badge variant="outline" className="text-[10px]">
                        {rate.amortizationSystem.replace("_", " + ")}
                      </Badge>
                    )}
                  </div>

                  <div className="text-2xl font-bold text-primary mb-3">
                    {rate.rate}% <span className="text-sm font-normal text-muted-foreground">a.a.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground mb-2">
                    <div className="flex justify-between">
                      <span>Prazo:</span>
                      <span className="font-medium text-foreground">{rate.maxTerm}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrada:</span>
                      <span className="font-medium text-foreground">{rate.minDownPayment}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Idade:</span>
                      <span className="font-medium text-foreground">{rate.minAge}-{rate.maxAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tx. Adm:</span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rate.monthlyAdminFee || 0)}
                      </span>
                    </div>
                  </div>

                  {rate.conditions && (
                    <div className="bg-muted/30 p-2 rounded text-xs flex gap-2">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <p>{rate.conditions}</p>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteRate(rate.id)} className="self-end mt-2 text-destructive hover:text-destructive">
                  Remover
                </Button>
              </div>
            ))}
            {settings.bankRates.length === 0 && (
              <div className="col-span-full text-center py-4 text-muted-foreground text-sm">Nenhuma taxa cadastrada.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contas Bancárias</CardTitle>
            <CardDescription>Contas para recebimento de sinais e pagamentos.</CardDescription>
          </div>
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Conta Bancária</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      value={newAccount.bankName}
                      onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input
                      value={newAccount.accountType}
                      onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value as any })}
                      placeholder="Ex: Corrente, PJ"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      value={newAccount.agency}
                      onChange={(e) => setNewAccount({ ...newAccount, agency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titular</Label>
                  <Input
                    value={newAccount.holderName}
                    onChange={(e) => setNewAccount({ ...newAccount, holderName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPF/CNPJ</Label>
                    <Input
                      value={newAccount.holderDocument}
                      onChange={(e) => setNewAccount({ ...newAccount, holderDocument: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input
                      value={newAccount.pixKey}
                      onChange={(e) => setNewAccount({ ...newAccount, pixKey: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddAccount} disabled={saving}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {settings.bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{account.bankName}</span>
                    <Badge variant="secondary" className="text-xs">{account.accountType}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agência:</span>
                    <span>{account.agency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conta:</span>
                    <span>{account.accountNumber}</span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <div className="text-xs text-muted-foreground">Titular</div>
                    <div>{account.holderName}</div>
                    <div className="text-xs text-muted-foreground">{account.holderDocument}</div>
                  </div>
                  {account.pixKey && (
                    <div className="pt-2 border-t mt-2 bg-muted/30 -mx-4 -mb-4 p-3 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">Chave PIX</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => {
                          navigator.clipboard.writeText(account.pixKey!);
                          toast({
                            title: "Sucesso",
                            description: "Chave PIX copiada!",
                            variant: "success",
                          });
                        }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium truncate">{account.pixKey}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {settings.bankAccounts.length === 0 && (
              <div className="col-span-full text-center py-4 text-muted-foreground text-sm">Nenhuma conta bancária cadastrada.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
