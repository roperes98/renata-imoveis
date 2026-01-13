import { UserRole } from "@/app/context/UserRoleContext";

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "comprador", "vendedor", "corretor", "parceiro"],
  "/dashboard/imoveis": ["admin", "comprador", "corretor", "parceiro"],
  "/dashboard/condominios": ["admin", "corretor"],
  "/dashboard/vendas": ["admin", "comprador", "vendedor", "corretor", "parceiro"],
  "/dashboard/clientes": ["admin", "corretor"],
  "/dashboard/time": ["admin", "corretor"],
};

export const DEFAULT_REDIRECT = "/dashboard";
