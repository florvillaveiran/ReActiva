import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, User as UserIcon, Building2 } from "lucide-react";
import { api } from "./lib/store";

interface Props {
  onLogin: (user: { role: string; name: string; companyId: string }) => void;
}

export default function PlataformaHome({ onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [error, setError] = useState("");

  const companies = api.getCompanies();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const user = api.findUser(email, password);
      if (!user) {
        setError("Email o contraseña incorrectos.");
        return;
      }
      onLogin({ role: user.role, name: user.name, companyId: user.companyId });
    } else {
      if (!selectedCompany) {
        setError("Seleccioná tu empresa.");
        return;
      }
      const existing = api.getUsers().find((u) => u.email === email);
      if (existing) {
        setError("Ya existe una cuenta con ese email.");
        return;
      }
      const newUser = api.addUser({
        name,
        email,
        password,
        companyId: selectedCompany,
        role: "user",
      });
      onLogin({ role: newUser.role, name: newUser.name, companyId: newUser.companyId });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -mr-64 -mt-64"
        style={{ background: "rgba(16, 185, 129, 0.12)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -ml-48 -mb-48"
        style={{ background: "rgba(16, 185, 129, 0.06)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-6">
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.05em" }}>
              <span style={{ color: "#fff" }}>Re</span>
              <span style={{ color: "#10b981", fontStyle: "italic" }}>Activa</span>
            </span>
          </div>
          <h1 style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Bienvenido al Bienestar
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontWeight: 500 }}>
            Potenciando el bienestar de tu equipo.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "2rem", padding: "2rem", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Register-only fields */}
            {!isLogin && (
              <>
                <div>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", display: "block", marginBottom: "0.4rem", marginLeft: "0.25rem" }}>
                    Nombre Completo
                  </label>
                  <div style={{ position: "relative" }}>
                    <UserIcon style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      style={{ width: "100%", background: "#f9fafb", border: "none", borderRadius: "0.75rem", padding: "1rem 1.25rem 1rem 3.5rem", fontSize: "0.875rem", fontWeight: 500, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", display: "block", marginBottom: "0.4rem", marginLeft: "0.25rem" }}>
                    Tu Empresa
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building2 style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                    <select
                      required
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      style={{ width: "100%", background: "#f9fafb", border: "none", borderRadius: "0.75rem", padding: "1rem 1.25rem 1rem 3.5rem", fontSize: "0.875rem", fontWeight: 500, outline: "none", appearance: "none", boxSizing: "border-box" }}
                    >
                      <option value="">Seleccioná tu empresa</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", display: "block", marginBottom: "0.4rem", marginLeft: "0.25rem" }}>
                {isLogin ? "Email Institucional" : "Email"}
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  style={{ width: "100%", background: "#f9fafb", border: "none", borderRadius: "0.75rem", padding: "1rem 1.25rem 1rem 3.5rem", fontSize: "0.875rem", fontWeight: 500, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", display: "block", marginBottom: "0.4rem", marginLeft: "0.25rem" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#9ca3af" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", background: "#f9fafb", border: "none", borderRadius: "0.75rem", padding: "1rem 1.25rem 1rem 3.5rem", fontSize: "0.875rem", fontWeight: 500, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 500, textAlign: "center" }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "1rem",
                padding: "1rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
                marginTop: "0.5rem",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                transition: "filter 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              <ArrowRight style={{ width: "1rem", height: "1rem" }} />
            </button>
          </form>

          {/* Toggle */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#10b981")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              {isLogin ? "¿No tenés cuenta? Solicitá una" : "¿Ya sos parte? Ingresá aquí"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Re-Activa Wellness Systems © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
