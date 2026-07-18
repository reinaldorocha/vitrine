import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { ScreenState } from "../types";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onBack, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      let errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "Usuário não encontrado ou senha incorreta. Você já criou este usuário no painel do Firebase?";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "O login por E-mail/Senha não está ativado no seu Firebase.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#000000] text-[#e2e2e2] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-magenta/10 blur-[130px] rounded-full -z-10 pointer-events-none" />

      {/* Back Button */}
      <button
        id="btn-back-to-store"
        onClick={onBack}
        className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-sm font-semibold text-brand-gray-light/60 hover:text-brand-magenta transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para a Vitrine
      </button>

      <motion.div
        id="login-card-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] px-4"
      >
        {/* Escola Cursos Brand Identity Header */}
        <div id="login-brand" className="flex flex-col items-center justify-center gap-3 mb-8">
          <div className="relative w-full max-w-[200px] flex items-center justify-center">
            <img 
              src="https://i.ibb.co/zj7h3M5/logo-ESCOLA-CURSOS.png" 
              alt="Logo Escola Cursos"
              referrerPolicy="no-referrer"
              className="h-14 w-auto object-contain"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#e2e2e2]/60 mt-1">
            Plataforma Administrativa
          </span>
        </div>

        {/* Welcome titles */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Entrar</h2>
          <p className="text-brand-gray-light/60 text-sm mt-1">Acesse sua plataforma</p>
        </div>

        {/* Login Form */}
        <form id="form-login" onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-gray-light/80">
              E-mail ou Usuário
            </label>
            <input
              id="input-login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="u@email.com"
              className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg px-4 py-3.5 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-gray-light/80">
                Senha de Acesso
              </label>
            </div>
            <div className="relative">
              <input
                id="input-login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#2d2d2d] focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta rounded-lg pl-4 pr-11 py-3.5 text-sm text-white placeholder-brand-gray-light/30 outline-none transition-all"
                required
              />
              <button
                id="btn-toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-light/40 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me & Demo Note */}
          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#2d2d2d] bg-[#121212] text-brand-magenta focus:ring-brand-magenta/30 w-4 h-4"
              />
              <span className="text-brand-gray-light/70 font-medium">Lembrar de mim</span>
            </label>
          </div>

          {/* Entry Button */}
          <button
            id="btn-login"
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-magenta hover:bg-[#ff33ff] active:scale-98 text-white font-bold py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(255,0,255,0.25)] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            id="btn-recover-password"
            onClick={() => {
              alert(
                "Entre em contato com o suporte para recuperar sua senha."
              );
            }}
            className="text-brand-magenta/80 hover:text-white font-medium text-xs transition-colors"
          >
            Recuperar senha
          </button>
        </div>
      </motion.div>
    </div>
  );
}
