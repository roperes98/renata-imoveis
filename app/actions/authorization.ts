"use server";

import { headers } from "next/headers";

export async function submitAuthorization(formData: any, clientSignatureData: {
  latitude?: number;
  longitude?: number;
  userAgent: string;
  timestamp: string;
}) {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'Unknown';

  const serverTimestamp = new Date().toISOString();

  const auditTrail = {
    ...clientSignatureData,
    ip,
    serverTimestamp,
    // In a real app, you might want to compare client timestamp vs server timestamp
    // to detect major discrepancies, though timezones make this tricky.
  };

  console.log("--- ELECTRONIC SIGNATURE SUBMISSION ---");
  console.log("Form Data:", JSON.stringify(formData, null, 2));
  console.log("Audit Trail:", JSON.stringify(auditTrail, null, 2));
  console.log("---------------------------------------");

  // TODO: Save to database
  // Here we would insert into the database including the audit trail JSON/columns

  return {
    success: true,
    message: "Authorization submitted successfully with electronic signature.",
    auditTrail
  };
}
