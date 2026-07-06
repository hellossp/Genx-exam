"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { user, login, signup, loginWithGoogle, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && !loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, mounted, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Google Sign-in failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border-color-light)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "var(--text-secondary)" }}>Loading Genx Exam room...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex-center" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "420px", padding: "36px 28px" }}>
        
        {/* Header Logo */}
        <div style={{ marginBottom: "28px" }}>
          <div className="flex-center" style={{ 
            width: "52px", 
            height: "52px", 
            borderRadius: "12px", 
            background: "var(--primary-light)", 
            border: "2px solid var(--border-color)",
            marginBottom: "16px"
          }}>
            <BookOpen size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h2>{isLogin ? "Welcome Back, Host" : "Create Host Account"}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px", textAlign: "left" }}>
            {isLogin ? "Sign in to manage Genx Exam portals and check student rosters." : "Get started with your teacher analytical panel today."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ 
            background: "var(--danger-light)", 
            color: "var(--danger)", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            fontSize: "13px", 
            marginBottom: "20px",
            border: "2px solid var(--danger)",
            textAlign: "left"
          }}>
            {error.includes("auth/") ? error.split("auth/")[1].replace(/-/g, " ") : error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email">Teacher Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
              <input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="password">Secret Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", height: "46px", marginTop: "10px" }}
            disabled={submitLoading}
          >
            {isLogin ? (
              <>
                <LogIn size={18} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Register Account
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: "10px" }}>
          <div style={{ flex: 1, height: "2px", background: "var(--border-color-light)" }}></div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "bold" }}>OR</span>
          <div style={{ flex: 1, height: "2px", background: "var(--border-color-light)" }}></div>
        </div>

        {/* Google Authentication */}
        <button 
          onClick={handleGoogleSignIn} 
          className="btn btn-secondary" 
          style={{ width: "100%", height: "46px", gap: "12px" }}
          disabled={submitLoading}
        >
          {/* Custom Google Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign in with Gmail
        </button>

        {/* Toggle Login/Register */}
        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "24px", color: "var(--text-secondary)" }}>
          {isLogin ? "New instructor?" : "Already registered?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--primary)", 
              fontWeight: "700", 
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              textDecoration: "underline",
              padding: 0
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

      </div>
    </div>
  );
}
