"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Shield, Clock, BookOpen, User, AlertTriangle, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";

export default function StudentEntrance() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id;

  const [exam, setExam] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!examId || !mounted) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const examRef = doc(db, "exams", examId);
        const examSnap = await getDoc(examRef);

        if (examSnap.exists()) {
          const data = examSnap.data();
          if (data.status !== "active") {
            setError("This exam paper is currently not active or has been closed by the teacher.");
          } else {
            setExam({ id: examSnap.id, ...data });
          }
        } else {
          setError("Exam paper not found. Verify the examination code/link.");
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to fetch exam records. Check connectivity.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, mounted]);

  const handleStartExam = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError("Please enter your full name to begin.");
      return;
    }
    
    setError("");
    setJoining(true);

    try {
      const submissionData = {
        examId: exam.id,
        creatorId: exam.creatorId,
        studentName: studentName.trim(),
        startedAt: serverTimestamp(),
        submittedAt: null,
        status: "started",
        score: 0,
        totalPoints: exam.questions?.reduce((acc, q) => acc + (q.points || 0), 0) || 0,
        tabSwitches: 0,
        answers: {},
        timePerQuestion: {},
        logs: []
      };

      const docRef = await addDoc(collection(db, "submissions"), submissionData);
      router.push(`/exam/${exam.id}/take?submissionId=${docRef.id}`);
    } catch (err) {
      console.error("Error creating student session:", err);
      setError("Failed to initialize student test sheet. Please try again.");
      setJoining(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border-color-light)",
          borderTopColor: "var(--success)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "var(--text-secondary)" }}>Fetching test paper guidelines...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex-center" style={{ minHeight: "100vh", padding: "20px", flexDirection: "column" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "32px", marginBottom: "40px" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "800", color: "var(--primary)", marginBottom: "24px" }}>
          <BookOpen size={26} />
          Genx Exam Candidate Entry
        </div>

        {error && (
          <div style={{ 
            background: "var(--danger-light)", 
            color: "var(--danger)", 
            padding: "16px", 
            borderRadius: "10px", 
            fontSize: "14px", 
            marginBottom: "24px",
            border: "2px solid var(--danger)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            textAlign: "left"
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>{error}</div>
          </div>
        )}

        {exam && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>{exam.title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", textAlign: "left" }}>
              {exam.description || "No description or instructions provided."}
            </p>

            {/* Exam info badges */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", border: "1.5px solid var(--border-color)", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>
                <Clock size={16} style={{ color: "var(--primary)" }} />
                <span>{exam.duration} Minutes</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-secondary)", border: "1.5px solid var(--border-color)", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>
                <BookOpen size={16} style={{ color: "var(--success)" }} />
                <span>{exam.questions?.length || 0} Questions</span>
              </div>
            </div>

            {/* Warning block */}
            <div style={{ 
              background: "var(--warning-light)", 
              color: "#a16207", 
              padding: "16px", 
              borderRadius: "10px", 
              fontSize: "13px", 
              marginBottom: "24px",
              border: "2px solid var(--warning)",
              display: "flex",
              gap: "12px",
              textAlign: "left"
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: "block", marginBottom: "4px" }}>Anti-Cheating Logs Enabled</strong>
                Leaving this browser window, opening other websites, or shifting tabs will be flagged. Examiners will receive switch counters immediately.
              </div>
            </div>

            {/* Name Form */}
            <form onSubmit={handleStartExam}>
              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label" htmlFor="studentName">Student Full Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
                  <input
                    id="studentName"
                    type="text"
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: "42px" }}
                    required
                    disabled={joining}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                style={{ width: "100%", height: "46px", gap: "8px" }}
                disabled={joining}
              >
                {joining ? "Generating Student Card..." : "Open Exam Sheet"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Credit footer */}
      <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
        Developed by <a href="https://www.instantpages.site/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>instant pages</a>
      </div>
    </div>
  );
}
