"use server";

import { signIn } from "@/auth";

export async function googleAuthenticate() {
  await signIn("google", { redirectTo: "/dashboard" });
}
