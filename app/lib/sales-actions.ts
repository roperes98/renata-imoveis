
"use server";

import { revalidatePath } from "next/cache";
import { getSaleById, updateSale, updateSaleStep } from "./sales-service";

export async function uploadChecklistDocument(saleId: string, stepId: string, checklistItemId: string, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "No file provided" };

  // In a real app, upload to Supabase Storage here
  // const { data, error } = await supabase.storage.from('docs').upload(...)

  // Simulating upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  const mockFileUrl = `https://fake-storage.com/${file.name}`;

  // Get current sale state
  const sale = await getSaleById(saleId);
  if (!sale) return { success: false, message: "Sale not found" };

  const step = sale.steps.find(s => s.id === stepId);
  if (!step || !step.checklist) return { success: false, message: "Step not found" };

  // Update checklist item
  const newChecklist = step.checklist.map(item => {
    if (item.id === checklistItemId) {
      return { ...item, status: "uploaded" as const, fileUrl: mockFileUrl };
    }
    return item;
  });

  await updateSaleStep(saleId, stepId, { checklist: newChecklist });

  revalidatePath(`/dashboard/vendas/${saleId}`);
  return { success: true, message: "File uploaded successfully" };
}

export async function toggleChecklistItem(saleId: string, stepId: string, checklistItemId: string, checked: boolean) {
  const sale = await getSaleById(saleId);
  if (!sale) return { success: false, message: "Sale not found" };

  const step = sale.steps.find(s => s.id === stepId);
  if (!step || !step.checklist) return { success: false, message: "Step not found" };

  const newChecklist = step.checklist.map(item => {
    if (item.id === checklistItemId) {
      return { ...item, status: checked ? "approved" as const : "pending" as const };
    }
    return item;
  });

  await updateSaleStep(saleId, stepId, { checklist: newChecklist });
  revalidatePath(`/dashboard/vendas/${saleId}`);
  return { success: true };
}

export async function completeStep(saleId: string, stepId: string) {
  const sale = await getSaleById(saleId);
  if (!sale) return { success: false, message: "Sale not found" };

  const currentStepIndex = sale.steps.findIndex(s => s.id === stepId);
  if (currentStepIndex === -1) return { success: false, message: "Step not found" };

  // Mark current step as completed
  await updateSaleStep(saleId, stepId, { status: "completed" });

  // If there is a next step, unlock it
  const nextStepIndex = currentStepIndex + 1;
  if (nextStepIndex < sale.steps.length) {
    const nextStep = sale.steps[nextStepIndex];
    // If it was skipped, maybe jump over it? For simplicity, we just set IN_PROGRESS whatever comes next
    // unless logic dictates otherwise.

    // Simple logic: Activate next step
    await updateSaleStep(saleId, nextStep.id, { status: "in_progress" });
    await updateSale(saleId, { current_step_index: nextStepIndex });
  } else {
    // All steps done
    await updateSale(saleId, { status: "completed" });
  }

  revalidatePath(`/dashboard/vendas/${saleId}`);
  return { success: true };
}

export async function skipStep(saleId: string, stepId: string) {
  const sale = await getSaleById(saleId);
  if (!sale) return { success: false, message: "Sale not found" };

  const currentStepIndex = sale.steps.findIndex(s => s.id === stepId);
  if (currentStepIndex === -1) return { success: false, message: "Step not found" };

  // Mark as skipped
  await updateSaleStep(saleId, stepId, { status: "skipped" });

  // Activate next step
  const nextStepIndex = currentStepIndex + 1;
  if (nextStepIndex < sale.steps.length) {
    const nextStep = sale.steps[nextStepIndex];
    await updateSaleStep(saleId, nextStep.id, { status: "in_progress" });
    await updateSale(saleId, { current_step_index: nextStepIndex });
  }

  revalidatePath(`/dashboard/vendas/${saleId}`);
  return { success: true };
}

export async function updateRGIData(saleId: string, stepId: string, rgiData: any) {
  const sale = await getSaleById(saleId);
  if (!sale) return { success: false, message: "Sale not found" };

  await updateSaleStep(saleId, stepId, { rgiData });
  revalidatePath(`/dashboard/vendas/${saleId}`);
  return { success: true };
}
