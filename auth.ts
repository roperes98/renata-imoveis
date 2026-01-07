import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { User, Agent, Client } from "@/app/lib/types/database";

// Use Service Role Key to bypass RLS for auth checks
// WARNING: This key must be in .env.local and MUST NOT be exposed to the client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUser(email: string): Promise<{ user: User; role: string; phone: string | null } | null> {
  // 1. Fetch User Identity
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    if (error && error.code !== "PGRST116") {
      console.error("Failed to fetch user:", error);
    }
    return null;
  }

  // 2. Fetch Profiles to determine Role and Phone
  // Parallel requests for performance
  const [agentResult, clientResult] = await Promise.all([
    supabaseAdmin.from("agents").select("*").eq("user_id", user.id).single(),
    supabaseAdmin.from("clients").select("*").eq("user_id", user.id).single(), // Assuming 1:1 or taking first
  ]);

  let role = "user"; // Default role
  let phone: string | null = null;

  if (agentResult.data) {
    role = "agent"; // Priority to Agent
    phone = agentResult.data.phone;
  } else if (clientResult.data) {
    role = "client";
    phone = clientResult.data.phone;
  } else if (user.role) {
    role = user.role; // Fallback to existing role column if no profile found (migration safety)
  }

  return { user, role, phone };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const data = await getUser(email);
          if (!data) return null;

          const { user, role, phone } = data;

          if (!user.password_hash) return null; // User registered via OAuth or Shadow, must use OAuth or Claim

          const passwordsMatch = await bcrypt.compare(password, user.password_hash);
          if (passwordsMatch) {
            // Return user with Unified attributes
            return {
              ...user,
              role: role, // Override DB role with determined role
              phone: phone // Inject phone from profile
            };
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email, name, image } = user;
        if (!email) return false;

        const data = await getUser(email);

        if (!data) {
          // New User via Google
          // 1. Create User
          const { data: newUser, error: userError } = await supabaseAdmin
            .from("users")
            .insert({
              email,
              full_name: name,
              avatar_url: image,
              password_hash: null, // OAuth
              role: "user", // Default
            })
            .select()
            .single();

          if (userError || !newUser) {
            console.error("Error creating user from Google login:", userError);
            return false;
          }

          // 2. Create Client Profile (default for new social logins)
          const { error: clientError } = await supabaseAdmin
            .from("clients")
            .insert({
              user_id: newUser.id,
              name: name || "Google User",
              // No phone available from Google usually
            });

          if (clientError) {
            console.error("Error creating client profile:", clientError);
            // Continue relying on User? Or fail? 
            // Ideally we want the profile. But failing login might be harsh.
          }
        } else {
          // User exists.
          // If "Shadow User" (password_hash null), Google login effectively claims/links it.
          // Nothing to do, allow login.
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Re-fetch role/phone to ensure session is up to date? 
        // Or persist from token? NextAuth JWT strategy usually persists.
        // For simplicity, we trust the token if we put it there. 
        // But we need to put it there. This requires `jwt` callback update.
        // For now, let's just return session. To pass role/phone to client, use `jwt` callback.
        session.user.id = token.sub;
        // session.user.role = token.role; // Need to add to types
        // session.user.phone = token.phone;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    ...authConfig.callbacks,
  },
});
