
import { getSaleById } from "@/app/lib/sales-service";
import { notFound } from "next/navigation";
import SaleDetailView from "./SaleDetailView";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  return <SaleDetailView sale={sale} />;
}
