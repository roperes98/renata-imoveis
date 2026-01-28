import { CompanySettings } from "../types/settings";

const STORAGE_KEY = "renata_imoveis_settings_mock";

const DEFAULT_SETTINGS: CompanySettings = {
  id: "1",
  creci: "12345-J",
  socials: {
    instagram: "renataimoveis",
    whatsapp: "5521999999999",
  },
  addresses: [
    {
      id: "1",
      label: "Sede",
      street: "Av. das Américas",
      number: "500",
      neighborhood: "Barra da Tijuca",
      city: "Rio de Janeiro",
      state: "RJ",
      zip: "22640-100",
      isMain: true,
    },
  ],
  bankRates: [],
  businessHours: [
    { day: "Monday", label: "Segunda", openTime: "09:00", closeTime: "18:00", isOpen: true },
    { day: "Tuesday", label: "Terça", openTime: "09:00", closeTime: "18:00", isOpen: true },
    { day: "Wednesday", label: "Quarta", openTime: "09:00", closeTime: "18:00", isOpen: true },
    { day: "Thursday", label: "Quinta", openTime: "09:00", closeTime: "18:00", isOpen: true },
    { day: "Friday", label: "Sexta", openTime: "09:00", closeTime: "18:00", isOpen: true },
    { day: "Saturday", label: "Sábado", openTime: "09:00", closeTime: "13:00", isOpen: true },
    { day: "Sunday", label: "Domingo", openTime: "00:00", closeTime: "00:00", isOpen: false },
  ],
  bankAccounts: [],
  roles: [
    {
      id: "admin",
      name: "Administrador",
      description: "Acesso total ao sistema",
      permissions: [
        "dashboard.view",
        "properties.view", "properties.create", "properties.edit", "properties.delete",
        "crm.view", "crm.edit",
        "finance.view", "finance.manage_commissions",
        "team.manage",
        "settings.view", "settings.edit",
        "site.customize"
      ],
      isSystem: true
    },
    {
      id: "gerente",
      name: "Gerente",
      description: "Gestão operacional e financeira",
      permissions: [
        "dashboard.view",
        "properties.view", "properties.create", "properties.edit",
        "crm.view", "crm.edit",
        "finance.view",
        "team.manage",
        "settings.view"
      ],
      isSystem: false
    },
    {
      id: "corretor",
      name: "Corretor",
      description: "Foco em vendas e clientes",
      permissions: [
        "dashboard.view",
        "properties.view", "properties.create", "properties.edit",
        "crm.view", "crm.edit"
      ],
      isSystem: false
    },
    {
      id: "corretor-parceiro",
      name: "Corretor Parceiro",
      description: "Foco em vendas e clientes",
      permissions: [
        "dashboard.view",
        "properties.view", "properties.create", "properties.edit",
        "crm.view", "crm.edit"
      ],
      isSystem: false
    }
  ],
};

class MockSettingsService {
  private getSettingsFromStorage(): CompanySettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(stored);

    // Ensure roles exist (migration for existing data)
    if (!parsed.roles || parsed.roles.length === 0) {
      parsed.roles = DEFAULT_SETTINGS.roles;
      this.saveSettings(parsed);
    }

    return parsed;
  }

  async getSettings(): Promise<CompanySettings> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.getSettingsFromStorage();
  }

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const current = this.getSettingsFromStorage();
    const updated = { ...current, ...settings };
    this.saveSettings(updated);
    return updated;
  }

  private saveSettings(settings: CompanySettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

export const settingsService = new MockSettingsService();
