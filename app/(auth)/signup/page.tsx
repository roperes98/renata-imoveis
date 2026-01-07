"use client";

import { useActionState, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import PhoneInput, { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { register } from "@/app/lib/actions";
import Link from "next/link";
import { LuEye, LuEyeOff } from "react-icons/lu";


export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerState, registerAction, isRegisterPending] = useActionState(register, undefined);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country | undefined>("BR");

  // Handle form submission wrapper to inject phone number into FormData for Register
  const handleRegisterSubmit = (payload: FormData) => {
    payload.set("phone", phone);
    registerAction(payload);
  };

  return (
    <>
      {/* Text content */}
      <div className="mb-8 sm:mb-10 space-y-6 sm:space-y-10">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold leading-[1.521] text-[#1E293B]">
            Crie sua conta
          </h1>
          <p className="text-sm sm:text-base font-normal leading-[1.521] text-[#475569] max-w-[351px]">
            Preencha os dados abaixo para se cadastrar na plataforma.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 sm:space-y-8">
        {registerState && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {registerState}
          </div>
        )}

        <form action={handleRegisterSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold leading-[1.521] text-[#1E293B]"
              >
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full px-3 py-4 border border-[#E2E8F0] rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent"
                placeholder="Digite seu nome"
                required
              />
            </div>
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
                className="w-full px-3 py-4 border border-[#E2E8F0] rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold leading-[1.521] text-[#1E293B]"
              >
                Telefone
              </label>
              <PhoneInput
                defaultCountry="BR"
                limitMaxLength={true}
                placeholder={
                  country
                    ? getExampleNumber(country, examples)?.formatNational()
                    : "(XX) XXXXX-XXXX"
                }
                value={phone}
                onChange={(value) => setPhone(value as string)}
                onCountryChange={(v) => setCountry(v as Country)}
                id="phone"
                className="w-full px-3 py-4 border border-[#E2E8F0] rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus-within:ring-2 focus-within:ring-[#B22A22] focus-within:border-transparent [&>input]:outline-none [&>input]:text-[#94A3B8]"
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
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password field */}
              <div className="space-y-2 mt-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold leading-[1.521] text-[#1E293B]"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-4 border rounded bg-white text-sm font-normal leading-[1.521] text-[#94A3B8] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent ${confirmPassword && password !== confirmPassword ? "border-red-500 focus:ring-red-500" : "border-[#E2E8F0]"
                    }`}
                  placeholder="Confirme sua senha"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                )}
              </div>

              {/* Password rules */}
              <div className="space-y-2 mt-2">
                <p className="text-xs font-semibold text-[#475569]">Sua senha deve conter:</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center gap-2 ${password.length >= 8 ? "text-green-600" : "text-[#475569]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-green-600" : "bg-[#CBD5E1]"}`} />
                    Mínimo de 8 caracteres
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : "text-[#475569]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-green-600" : "bg-[#CBD5E1]"}`} />
                    Pelo menos uma letra maiúscula
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/[a-z]/.test(password) ? "text-green-600" : "text-[#475569]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? "bg-green-600" : "bg-[#CBD5E1]"}`} />
                    Pelo menos uma letra minúscula
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : "text-[#475569]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-green-600" : "bg-[#CBD5E1]"}`} />
                    Pelo menos um número
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-[#475569]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "bg-green-600" : "bg-[#CBD5E1]"}`} />
                    Pelo menos um caractere especial
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isRegisterPending || (confirmPassword !== "" && password !== confirmPassword)}
            className={`w-full bg-[#B22A22] text-white py-4 px-6 rounded font-bold text-base leading-[1.521] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22A22] flex justify-center items-center ${isRegisterPending || (confirmPassword !== "" && password !== confirmPassword) ? "opacity-70 cursor-not-allowed" : "hover:bg-[#960000]"
              }`}
          >
            {isRegisterPending ? (
              <FaSpinner className="animate-spin text-xl" />
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-base font-normal leading-[1.521] text-[#475569]">
          Já tem uma conta? <Link href="/login" className="text-[#B22A22] hover:underline focus:outline-none">Faça login</Link>
        </p>
      </div>
    </>

  );
}
