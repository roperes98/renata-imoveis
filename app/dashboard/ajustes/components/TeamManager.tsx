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
import { Checkbox } from "@/components/ui/checkbox";
import { settingsService } from "@/app/lib/services/mock-settings-service";
import { CompanySettings, Role, Permission } from "@/app/lib/types/settings";
import { useToast } from "@/components/ui/toast-context";
import { Loader2, Plus, Trash2, Shield, Pencil } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PERMISSION_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    permissions: [
      { id: "dashboard.view", label: "Visualizar Dashboard" },
    ],
  },
  {
    id: "properties",
    label: "Imóveis",
    permissions: [
      { id: "properties.view", label: "Visualizar Imóveis" },
      { id: "properties.create", label: "Cadastrar Imóveis" },
      { id: "properties.edit", label: "Editar Imóveis" },
      { id: "properties.delete", label: "Excluir Imóveis" },
    ],
  },
  {
    id: "crm",
    label: "Vendas & Clientes (CRM)",
    permissions: [
      { id: "crm.view", label: "Visualizar Clientes/Vendas" },
      { id: "crm.edit", label: "Gerenciar Clientes/Vendas" },
    ],
  },
  {
    id: "finance",
    label: "Financeiro",
    permissions: [
      { id: "finance.view", label: "Visualizar Financeiro" },
      { id: "finance.manage_commissions", label: "Gerenciar Comissões" },
    ],
  },
  {
    id: "settings",
    label: "Configurações & Equipe",
    permissions: [
      { id: "team.manage", label: "Gerenciar Cargos" },
      { id: "settings.view", label: "Visualizar Configurações" },
      { id: "settings.edit", label: "Editar Configurações" },
    ],
  },
  {
    id: "site",
    label: "Site",
    permissions: [
      { id: "site.customize", label: "Personalizar Site" },
    ],
  },
];

export function TeamManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
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

  async function handleSaveRole() {
    if (!settings || !editingRole.name) return;

    setSaving(true);
    try {
      let updatedRoles;
      if (editingRole.id) {
        // Edit existing
        updatedRoles = settings.roles.map((r) =>
          r.id === editingRole.id ? ({ ...r, ...editingRole } as Role) : r
        );
      } else {
        // Add new
        const newRole: Role = {
          id: crypto.randomUUID(),
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions || [],
          isSystem: false,
        };
        updatedRoles = [...(settings.roles || []), newRole];
      }

      await settingsService.updateSettings({ roles: updatedRoles });
      setSettings({ ...settings, roles: updatedRoles });
      toast({
        title: "Sucesso",
        description: "Cargo salvo com sucesso!",
        variant: "success",
      });
      setIsDialogOpen(false);
      setEditingRole({
        name: "",
        description: "",
        permissions: [],
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cargo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!settings) return;
    const role = settings.roles.find((r) => r.id === id);
    if (role?.isSystem) {
      toast({
        title: "Ação Inválida",
        description: "Não é possível remover um cargo do sistema.",
        variant: "destructive",
      });
      return;
    }

    const updatedRoles = settings.roles.filter((r) => r.id !== id);
    setSettings({ ...settings, roles: updatedRoles });
    await settingsService.updateSettings({ roles: updatedRoles });
    toast({
      title: "Sucesso",
      description: "Cargo removido.",
      variant: "default",
    });
  }

  function openEdit(role: Role) {
    setEditingRole({ ...role }); // Clone to avoid mutation
    setIsDialogOpen(true);
  }

  function openNew() {
    setEditingRole({
      name: "",
      description: "",
      permissions: [],
    });
    setIsDialogOpen(true);
  }

  function togglePermission(permissionId: string) {
    const currentPermissions = editingRole.permissions || [];
    if (currentPermissions.includes(permissionId as Permission)) {
      setEditingRole({
        ...editingRole,
        permissions: currentPermissions.filter((p) => p !== permissionId),
      });
    } else {
      setEditingRole({
        ...editingRole,
        permissions: [...currentPermissions, permissionId as Permission],
      });
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cargos e Permissões</CardTitle>
          <CardDescription>Defina os papéis e o que cada um pode fazer no sistema.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole.id ? "Editar Cargo" : "Novo Cargo"}</DialogTitle>
              <DialogDescription>
                Configure o nome e as permissões de acesso.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cargo</Label>
                  <Input
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    placeholder="Ex: Corretor Júnior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (Opcional)</Label>
                  <Input
                    value={editingRole.description || ""}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    placeholder="Breve descrição das responsabilidades"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissões</Label>
                <div className="border rounded-md">
                  <Accordion type="multiple" defaultValue={["properties", "crm"]} className="w-full">
                    {PERMISSION_GROUPS.map((group) => (
                      <AccordionItem value={group.id} key={group.id}>
                        <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50">
                          {group.label}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.permissions.map((perm) => (
                              <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={perm.id}
                                  checked={(editingRole.permissions || []).includes(perm.id as Permission)}
                                  onCheckedChange={() => togglePermission(perm.id)}
                                />
                                <label
                                  htmlFor={perm.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {perm.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveRole} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Cargo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(settings.roles || []).map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.isSystem && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground uppercase font-bold tracking-wider">
                        Sistema
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {role.permissions.length} permissões ativas
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(!settings.roles || settings.roles.length === 0) && (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
              Nenhum cargo definido. Crie um novo para começar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
