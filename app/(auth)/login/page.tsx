"use client";

import { useActionState, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";


import { authenticate } from "@/app/lib/actions";
import { googleAuthenticate } from "@/app/lib/google-action";
import Link from "next/link";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [loginState, loginAction, isLoginPending] = useActionState(authenticate, undefined);

  return (
    <>
      {/* Text content */}
      <div className="mb-8 sm:mb-10 space-y-6 sm:space-y-10">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold leading-[1.521] text-[#1E293B]">
            Acesse a plataforma
          </h1>
          <p className="text-sm sm:text-base font-normal leading-[1.521] text-[#475569] max-w-[351px]">
            Faça login ou registre-se para começar a construir seus projetos ainda hoje.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 sm:space-y-8">
        {loginState && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {loginState}
          </div>
        )}

        <form action={loginAction} className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold leading-[1.521] text-[#1E293B]"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-4 border border-[#E2E8F0] rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold leading-[1.521] text-[#1E293B]"
                >
                  Senha
                </label>
                <Link
                  href={email ? `/recover-password?email=${encodeURIComponent(email)}` : "/recover-password"}
                  className="text-sm font-semibold leading-[1.521] text-[#B22A22] hover:underline focus:outline-none"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-4 pr-12 border border-[#E2E8F0] rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1E293B] focus:outline-none"
                >
                  {showPassword ? (
                    <LuEye className="w-4.5 h-4.5" />
                  ) : (
                    <LuEyeOff className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full bg-[#B22A22] text-white py-4 px-6 rounded font-bold text-base leading-[1.521] hover:bg-[#960000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22A22] flex justify-center items-center"
          >
            {isLoginPending ? (
              <FaSpinner className="animate-spin text-xl" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-base font-normal leading-[1.521] text-[#475569]">
          Ainda não possui uma conta? <Link href="/signup" className="text-[#B22A22] hover:underline focus:outline-none">Criar conta</Link>
        </p>

        {/* Google button */}
        <form action={googleAuthenticate}>
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-white text-[#1E293B] border border-[#E2E8F0] py-4 px-6 rounded hover:cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E2E8F0]"
          >
            <FcGoogle className="text-xl" />
            <span className="text-sm font-semibold">Entrar com Google</span>
          </button>
        </form>
      </div>
    </>

  );
}
