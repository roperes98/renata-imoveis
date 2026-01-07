
import { SaleProcess, SALES_STEPS_TEMPLATE, SaleStep } from "./types/sales";
import { RealEstate, Client, Offer, SellingStatus } from "./types/database";

// Mock Data for Development
const BASE_PROPERTY: RealEstate = {
  id: "prop-base",
  code: "REF-XXXX",
  type: "apartment",
  status: "pending" as SellingStatus,
  sale_price: 1500000,
  address_street: "Av. Atlântica",
  address_number: "100",
  address_neighborhood: "Copacabana",
  address_city: "Rio de Janeiro",
  address_state: "RJ",
  address_zip: "22000-000",
  address_complement: "Apt 501",
  bedrooms: 3,
  bathrooms: 2,
  parking_spaces: 1,
  usable_area: 120,
  total_area: 120,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  features: [],
  youtube_url: null,
  virtual_tour_url: null,
  description: "Imóvel Mock para Testes",
  transaction_type: "sale",
  condominium_fee: 1500,
  is_condo_fee_exempt: false,
  property_tax: 300,
  is_property_tax_exempt: false,
  property_tax_period: "monthly",
  floor_number: 5,
  suites: 1,
  rent_price: null,
  condominium_id: null,
  condominium_address_id: null
};

const MOCK_CLIENTS: Client[] = [
  {
    id: "client-1",
    name: "Comprador Exemplo",
    email: "comprador@example.com",
    phone: "(21) 99999-9999",
    user_id: "user-1",
    whatsapp: null,
    notes: null,
    instagram: null,
    created_at: new Date().toISOString()
  },
  {
    id: "client-2",
    name: "Vendedor Exemplo",
    email: "vendedor@example.com",
    phone: "(21) 98888-8888",
    user_id: "user-2",
    whatsapp: null,
    notes: null,
    instagram: null,
    created_at: new Date().toISOString()
  }
];

// Generate 8 mock sales, one for each step in the template
const MOCK_SALES: SaleProcess[] = SALES_STEPS_TEMPLATE.map((targetStep, index) => {
  const saleId = `sale-step-${index}`;
  const propertyCode = `REF-TEST-${index + 1}`;

  // Create status for each step relative to the current target index
  const steps = SALES_STEPS_TEMPLATE.map((s, sIdx) => {
    let status: "completed" | "in_progress" | "pending" | "skipped" = "pending";

    // Logic to determine status
    if (sIdx < index) status = "completed";
    if (sIdx === index) status = "in_progress";

    // Simulate skipped financing for odd numbered sales (Cash payment simulation)
    if (s.id === 'financing' && (index % 2 !== 0)) {
      status = 'skipped';
    }

    // If financing was skipped, but we are past it, it remains skipped. 
    // If we are currently AT financing and it's skipped? No, usually if skipped we move to next.
    // For simplicity: if index > financing index, and we want to simulate skip, it's skipped.

    return {
      ...s,
      updated_at: new Date().toISOString(),
      status,
      checklist: s.checklist?.map(item => {
        const itemStatus = (status === "completed" ? "approved" :
          (status === "in_progress" && Math.random() > 0.5) ? "uploaded" : "pending") as "pending" | "uploaded" | "approved" | "rejected";
        
        // Para certidões que precisam de cuidado, adiciona datas de upload e expiração
        const needsCare = [
          "cert_receita", "cert_justica", "cert_trabalhista", "cert_fiscal_fazendaria",
          "cert_fiscal_vendedores", "cert_fiscal_imovel", "cert_rgi", "cert_iptu",
          "cert_condo", "cert_funesbom", "cert_interdicao_1", "cert_interdicao_2", "cert_distribuidor_civil"
        ].includes(item.id);

        let uploadedAt: string | null = null;
        let expiresAt: string | null = null;
        let validityDays: number | undefined = undefined;

        if (needsCare && (itemStatus === "approved" || itemStatus === "uploaded")) {
          // Simula datas de upload variadas para demonstrar diferentes estados de expiração
          const daysAgo = Math.floor(Math.random() * 35); // 0-35 dias atrás
          const uploadDate = new Date();
          uploadDate.setDate(uploadDate.getDate() - daysAgo);
          uploadedAt = uploadDate.toISOString();

          // Validade padrão de 30 dias
          validityDays = 30;
          const expirationDate = new Date(uploadDate);
          expirationDate.setDate(expirationDate.getDate() + validityDays);
          expiresAt = expirationDate.toISOString();
        }

        return {
          ...item,
          status: itemStatus,
          fileUrl: (status === "completed" || status === "in_progress") ? "https://example.com/doc.pdf" : undefined,
          uploadedAt,
          expiresAt,
          validityDays,
          needsCare: needsCare && (itemStatus === "approved" || itemStatus === "uploaded")
        };
      })
    };
  });

  const isCash = index % 2 !== 0; // Match the skip logic
  const offer: Offer = {
    id: `offer-${index}`,
    property_id: `prop-${index}`,
    client_id: "client-1",
    agent_id: null,
    offer_amount: 1000000 + (index * 100000), // Different prices
    payment_type: isCash ? "cash" : "financing",
    status: "accepted",
    created_at: new Date().toISOString()
  };

  return {
    id: saleId,
    offer_id: offer.id,
    offer: offer,
    property: {
      ...BASE_PROPERTY,
      id: `prop-${index}`,
      code: propertyCode,
      address_neighborhood: index % 2 === 0 ? "Ipanema" : "Leblon"
    },
    buyer: MOCK_CLIENTS[index % 2],
    seller: MOCK_CLIENTS[(index + 1) % 2],
    status: index === 7 ? "completed" : "active", // Last one completed
    current_step_index: index,
    steps: steps,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});


// Mutable Mock Data for Development
let MOCK_SALES_STORE: SaleProcess[] = MOCK_SALES;

export async function getSales(): Promise<SaleProcess[]> {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_SALES_STORE;
}

export async function getSaleById(id: string): Promise<SaleProcess | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_SALES_STORE.find(s => s.id === id);
}

// Helper to update sale in memory
export async function updateSale(saleId: string, updates: Partial<SaleProcess>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  MOCK_SALES_STORE = MOCK_SALES_STORE.map(sale =>
    sale.id === saleId ? { ...sale, ...updates } : sale
  );
}

export async function updateSaleStep(saleId: string, stepId: string, stepUpdates: Partial<SaleStep>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const saleIndex = MOCK_SALES_STORE.findIndex(s => s.id === saleId);
  if (saleIndex === -1) return;

  const sale = MOCK_SALES_STORE[saleIndex];
  const newSteps = sale.steps.map(step =>
    step.id === stepId ? { ...step, ...stepUpdates } : step
  );

  MOCK_SALES_STORE[saleIndex] = { ...sale, steps: newSteps };
}
