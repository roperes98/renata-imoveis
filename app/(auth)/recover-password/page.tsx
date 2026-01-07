"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { FaSpinner } from "react-icons/fa";
import { recoverPassword, verifyOTP } from "@/app/lib/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function RecoverPasswordPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false); // If we add password reset here later

  const [recoverState, recoverAction, isRecoverPending] = useActionState(async (prev: any, formData: FormData) => {
    const result = await recoverPassword(prev, formData);
    if (!result) { // Success returns null
      setStep("otp");
      return null;
    }
    return result;
  }, undefined);

  const [otpState, otpAction, isOtpPending] = useActionState(verifyOTP, undefined);

  // Focus management for OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleOtpSubmit = (formData: FormData) => {
    formData.set("otp", otp.join(""));
    formData.set("email", email);
    otpAction(formData);
  };

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setTimeLeft(60); // Start 60s countdown

    // Call server action to resend email
    const formData = new FormData();
    formData.append("email", email);
    await recoverPassword(null, formData);
  };

  // Start timer when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeLeft(60);
    }
  }, [step]);

  return (
    <>
      {/* Text content */}
      <div className="mb-8 sm:mb-10 space-y-6 sm:space-y-10">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold leading-[1.521] text-[#1E293B]">
            Recuperar Senha
          </h1>
          <p className="text-sm sm:text-base font-normal leading-[1.521] text-[#475569] max-w-[351px]">
            {step === "email"
              ? "Informe seu e-mail para receber o código de verificação."
              : "Digite o código de 6 dígitos enviado para seu e-mail."}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 sm:space-y-8">
        {recoverState && step === "email" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {recoverState}
          </div>
        )}
        {otpState && step === "otp" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {otpState}
          </div>
        )}

        {step === "email" ? (
          <form action={recoverAction} className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
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
            </div>

            <button
              type="submit"
              disabled={isRecoverPending}
              className="w-full bg-[#B22A22] text-white py-4 px-6 rounded font-bold text-base leading-[1.521] hover:bg-[#960000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22A22] flex justify-center items-center"
            >
              {isRecoverPending ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                "Enviar Código"
              )}
            </button>
          </form>
        ) : (
          <form action={handleOtpSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold leading-[1.521] text-[#1E293B]">
                  Código de Verificação
                </label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 text-center text-xl border border-[#E2E8F0] rounded bg-white font-semibold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#B22A22] focus:border-transparent"
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isOtpPending}
              className="w-full bg-[#B22A22] text-white py-4 px-6 rounded font-bold text-base leading-[1.521] hover:bg-[#960000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B22A22] flex justify-center items-center"
            >
              {isOtpPending ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                "Verificar Código"
              )}
            </button>

            <div className="flex justify-between items-center text-sm font-semibold">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-[#475569] hover:text-[#1E293B] hover:underline"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={timeLeft > 0}
                onClick={handleResend}
                className={`text-[#B22A22] hover:underline ${timeLeft > 0 ? "opacity-50 cursor-not-allowed no-underline" : ""}`}
              >
                {timeLeft > 0 ? `Reenviar em ${timeLeft}s` : "Reenviar código"}
              </button>
            </div>
          </form>
        )}

        <p className="text-base font-normal leading-[1.521] text-[#475569]">
          Lembrou sua senha? <Link href="/login" className="text-[#B22A22] hover:underline focus:outline-none">Faça login</Link>
        </p>
      </div>
    </>

  );
}
