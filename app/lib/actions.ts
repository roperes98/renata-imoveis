"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().min(10),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciais inválidas.";
        default:
          return "Algo deu errado.";
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData
) {
  const validatedFields = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return "Campos inválidos. Verifique os dados.";
  }

  const { email, password, name, phone } = validatedFields.data;

  // 1. Check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    // Case 1: Active User (has password or is Google user)
    if (existingUser.password_hash) {
      return "Email já cadastrado.";
    }

    // Case 2: Shadow User (Claim Account)
    // User exists but has no password (created as lead or Google without pass)
    // We allow setting a password here to "claim" the email login
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password_hash: hashedPassword,
        full_name: name // Update name if provided? Or keep existing? Let's update.
      })
      .eq("id", existingUser.id);

    if (updateError) {
      console.error("Error claiming account:", updateError);
      return "Erro ao atualizar conta.";
    }

    // Ensure Client Profile exists/is linked
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("user_id", existingUser.id)
      .single();

    if (!existingClient) {
      // Create missing client profile
      await supabaseAdmin.from("clients").insert({
        user_id: existingUser.id,
        name: name,
        phone: phone
      });
    } else {
      // Update phone if missing?
      if (!existingClient.phone) {
        await supabaseAdmin.from("clients").update({ phone }).eq("id", existingClient.id);
      }
    }

  } else {
    // Case 3: New User
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User Identity
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        full_name: name,
        role: "user"
      })
      .select()
      .single();

    if (userError || !newUser) {
      console.error("Registration error (User):", userError);
      return "Erro ao criar conta.";
    }

    // Create Client Profile
    const { error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        user_id: newUser.id,
        name: name,
        phone: phone
      });

    if (clientError) {
      console.error("Registration error (Client):", clientError);
      // Rollback user? Or strict? 
      // For now, log it. The user exists, they can login, but profile specific data might be missing.
      return "Conta criada, mas erro ao salvar perfil.";
    }
  }

  // Auto-login
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Erro ao fazer login automático.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

// Proposals & Visits Actions

const ProposalSchema = z.object({
  property_id: z.string().uuid(),
  client_id: z.string().uuid(),
  offer_amount: z.coerce.number().min(0),
  payment_type: z.enum(["cash", "financing", "mixed", "rent_to_own", "other"]),
  notes: z.string().optional(),
});

export async function createProposal(prevState: string | undefined, formData: FormData) {
  const validated = ProposalSchema.safeParse({
    property_id: formData.get("property_id"),
    client_id: formData.get("client_id"),
    offer_amount: formData.get("offer_amount"),
    payment_type: formData.get("payment_type"),
    notes: formData.get("notes"),
  });

  if (!validated.success) {
    return "Dados inválidos. Verifique os campos.";
  }

  const { property_id, client_id, offer_amount, payment_type, notes } = validated.data;

  // Insert offer
  const { error } = await supabaseAdmin.from("real_estate_offers").insert({
    property_id,
    client_id,
    offer_amount,
    payment_type,
    notes,
    status: "submitted"
  });

  if (error) {
    console.error("Error creating proposal:", error);
    return "Erro ao criar proposta.";
  }

  revalidatePath(`/dashboard/proposals/${property_id}`);
  redirect(`/dashboard/proposals/${property_id}`);
}

const VisitSchema = z.object({
  property_id: z.string().uuid(), // Assuming we can link valid property even if schema is ambiguous, using real_estate_id col
  client_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  scheduled_at: z.string().min(1), // datetime-local string
  notes: z.string().optional(),
});

export async function createVisit(prevState: string | undefined, formData: FormData) {
  const validated = VisitSchema.safeParse({
    property_id: formData.get("property_id"),
    client_id: formData.get("client_id"),
    agent_id: formData.get("agent_id"),
    scheduled_at: formData.get("scheduled_at"),
    notes: formData.get("notes"),
  });

  if (!validated.success) {
    return "Dados inválidos. Verifique os campos.";
  }

  const { property_id, client_id, agent_id, scheduled_at, notes } = validated.data;

  // Insert visit
  // Note: Using real_estate_id. If schema fails, consider checking DB.
  const { error } = await supabaseAdmin.from("real_estate_visits").insert({
    real_estate_id: property_id,
    client_id,
    agent_id,
    scheduled_at: new Date(scheduled_at).toISOString(),
    visit_status: "scheduled",
    notes
  });

  if (error) {
    console.error("Error creating visit:", error);
    return "Erro ao agendar visita.";
  }

  revalidatePath(`/dashboard/visits/${property_id}`);
  redirect(`/dashboard/visits/${property_id}`);
}

// Email Recovery Actions

const RecoverPasswordSchema = z.object({
  email: z.string().email(),
});

export async function recoverPassword(prevState: string | null | undefined, formData: FormData) {
  const validated = RecoverPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return "Email inválido.";
  }

  // Placeholder: Send email logic here
  console.log("Sending recovery email to:", validated.data.email);
  return null; // Return null on success, or string on error
}

const OTPSchema = z.object({
  otp: z.string().length(6),
  email: z.string().email(),
});

export async function verifyOTP(prevState: string | null | undefined, formData: FormData) {

  const validated = OTPSchema.safeParse({
    otp: formData.get("otp"),
    email: formData.get("email"),
  });

  if (!validated.success) {
    return "Código inválido.";
  }

  // Placeholder: Verify OTP logic here
  console.log("Verifying OTP:", validated.data.otp, "for", validated.data.email);

  // If valid, should probably redirect to reset password page or allow password reset inline
  // For now, let's assume it's successful
  return null;
}

