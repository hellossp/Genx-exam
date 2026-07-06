"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Activity, Code, Award, LogIn, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [examCode, setExamCode] = useState("");
  const [error, setError] = useState("");
  
  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoinExam = (e) => {
    e.preventDefault();
    if (!examCode.trim()) {
      setError("Please enter a valid exam code.");
      return;
    }
    setError("");
    router.push(`/exam/${examCode.trim()}`);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <header className="app-header">
        <div className="container nav-container">
          <div className="logo">
            <BookOpen size={28} style={{ color: "var(--primary)" }} />
            Genx Exam
          </div>
          <div>
            {mounted && (
              user ? (
                <button onClick={() => router.push("/dashboard")} className="btn btn-primary">
                  Go to Dashboard
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={() => router.push("/auth")} className="btn btn-secondary">
                  <LogIn size={16} />
                  Examiner Login
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "60px 0" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          
          {/* Hero Section */}
          <div style={{ marginBottom: "60px", padding: "0 10px" }}>
            <h1 style={{ fontSize: "52px", lineHeight: "1.2", marginBottom: "20px", fontWeight: "800" }}>
              The Playful & Secure <span style={{ color: "var(--primary)" }}>Exam Environment</span><br />
              for Modern Classrooms
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "18px", maxWidth: "680px", marginBottom: "32px", textAlign: "left" }}>
              Host academic assessments with real-time browser integrity tracking, multi-language code editors (C++, Java, Javascript), and automated recommendation feedback reports.
            </p>

            {/* CTAs */}
            <div style={{ 
              display: "flex", 
              gap: "24px", 
              justifyContent: "flex-start", 
              alignItems: "stretch", 
              flexWrap: "wrap",
              width: "100%"
            }}>
              
              {/* Student CTA */}
              <div className="glass-card" style={{ flex: "1 1 350px" }}>
                <h3 style={{ fontSize: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Award style={{ color: "var(--success)" }} />
                  Take an Exam
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px", textAlign: "left" }}>
                  Enter the unique exam invitation code provided by your teacher to open your classroom test sheet.
                </p>
                <form onSubmit={handleJoinExam} style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter Exam Code"
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-success">
                    Join Exam
                  </button>
                </form>
                {error && <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "8px" }}>{error}</p>}
              </div>

              {/* Examiner CTA */}
              <div className="glass-card" style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Activity style={{ color: "var(--primary)" }} />
                    Host an Exam
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px", textAlign: "left" }}>
                    Create exams, set up coding problems, run automated testing assertions, and analyze student response metrics.
                  </p>
                </div>
                {mounted && (
                  <button 
                    onClick={() => router.push(user ? "/dashboard" : "/auth")} 
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "10px" }}
                  >
                    Start Hosting
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Features Grid */}
          <div style={{ marginTop: "80px", padding: "0 10px" }}>
            <h2 style={{ fontSize: "32px", marginBottom: "40px" }}>A Classroom Platform Built for Integrity</h2>
            
            <div className="grid-dashboard">
              <div className="glass-card" style={{ padding: "30px" }}>
                <div style={{ background: "var(--primary-light)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Activity size={24} style={{ color: "var(--primary)" }} />
                </div>
                <h4 style={{ fontSize: "18px", marginBottom: "10px" }}>Classroom Registers</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "left" }}>
                  Review class stats, score distributions, and time spent on individual questions using visual tables and line graphs.
                </p>
              </div>

              <div className="glass-card" style={{ padding: "30px" }}>
                <div style={{ background: "var(--danger-light)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Shield size={24} style={{ color: "var(--danger)" }} />
                </div>
                <h4 style={{ fontSize: "18px", marginBottom: "10px" }}>Tab Lock Monitor</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "left" }}>
                  Keeps track of when students leave the test sheet. Tab switching is logged automatically and reported directly on the host panel.
                </p>
              </div>

              <div className="glass-card" style={{ padding: "30px" }}>
                <div style={{ background: "var(--warning-light)", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Code size={24} style={{ color: "#a16207" }} />
                </div>
                <h4 style={{ fontSize: "18px", marginBottom: "10px" }}>Sandbox Compiler</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "left" }}>
                  Includes C++, Java, and Javascript sandboxes. Students execute scripts against customizable examiner test cases instantly.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "2px solid var(--border-color)", padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "14px", background: "white" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span>&copy; {new Date().getFullYear()} Genx Exam. All rights reserved.</span>
          <span>
            Developed by <a href="https://www.instantpages.site/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>instant pages</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
