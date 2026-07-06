"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Plus, LogOut, Share2, TrendingUp, Users, BarChart2, Check, Copy, BookOpen, Trash2, Eye, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading, mounted, router]);

  useEffect(() => {
    if (!user || !mounted) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch host's exams
        const examsQuery = query(collection(db, "exams"), where("creatorId", "==", user.uid));
        const examsSnapshot = await getDocs(examsQuery);
        const examsList = examsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort exams by creation date (descending)
        examsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setExams(examsList);

        // Fetch submissions for this creator's exams
        const submissionsQuery = query(collection(db, "submissions"), where("creatorId", "==", user.uid));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsList = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(submissionsList);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, mounted]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const copyExamLink = (examId) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/exam/${examId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = async (examId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const examRef = doc(db, "exams", examId);
      await updateDoc(examRef, { status: newStatus });
      setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, status: newStatus } : ex));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteExam = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam? All student submissions for this exam will remain but will no longer be visible here.")) return;
    try {
      await deleteDoc(doc(db, "exams", examId));
      setExams(prev => prev.filter(ex => ex.id !== examId));
    } catch (err) {
      console.error("Failed to delete exam:", err);
    }
  };

  // Helper stats calculations
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0 
    ? Math.round((submissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / submissions.reduce((acc, sub) => acc + (sub.totalPoints || 1), 0)) * 100) 
    : 0;
  
  const totalFlaggedSwitches = submissions.reduce((acc, sub) => acc + (sub.tabSwitches || 0), 0);
  const avgTabSwitches = totalSubmissions > 0 ? (totalFlaggedSwitches / totalSubmissions).toFixed(1) : 0;

  if (!mounted || authLoading || loading) {
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
        <p style={{ color: "var(--text-secondary)" }}>Loading dashboard data...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <header className="app-header">
        <div className="container nav-container">
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            <BookOpen size={26} style={{ color: "var(--primary)" }} />
            Genx Exam <span style={{ fontSize: "11px", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "6px", marginLeft: "8px", fontWeight: "700", border: "1px solid var(--primary)" }}>Examiner</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "600" }}>{user?.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          
          {/* Dashboard Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "32px" }}>Examiner Dashboard</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Manage classes, configure examination papers, and track reports.</p>
            </div>
            <button onClick={() => router.push("/dashboard/create")} className="btn btn-primary" style={{ gap: "10px" }}>
              <Plus size={18} />
              Create Exam Paper
            </button>
          </div>

          {/* Stat summary cards */}
          <div className="grid-dashboard" style={{ marginBottom: "40px" }}>
            <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "var(--primary-light)", padding: "14px", borderRadius: "10px", color: "var(--primary)", border: "2px solid var(--border-color)" }}>
                <BarChart2 size={24} />
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Exams Created</span>
                <h2 style={{ fontSize: "28px", marginTop: "2px", fontWeight: "800" }}>{exams.length}</h2>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "var(--success-light)", padding: "14px", borderRadius: "10px", color: "var(--success)", border: "2px solid var(--border-color)" }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Student Entries</span>
                <h2 style={{ fontSize: "28px", marginTop: "2px", fontWeight: "800" }}>{totalSubmissions}</h2>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "var(--warning-light)", padding: "14px", borderRadius: "10px", color: "#a16207", border: "2px solid var(--border-color)" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Cohort Score</span>
                <h2 style={{ fontSize: "28px", marginTop: "2px", fontWeight: "800" }}>{avgScore}%</h2>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "var(--danger-light)", padding: "14px", borderRadius: "10px", color: "var(--danger)", border: "2px solid var(--border-color)" }}>
                <Shield size={24} />
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>Avg Tab Switches</span>
                <h2 style={{ fontSize: "28px", marginTop: "2px", fontWeight: "800" }}>{avgTabSwitches}</h2>
              </div>
            </div>
          </div>

          {/* Exams List Table */}
          <div className="glass-card" style={{ padding: "0 0 16px 0", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 16px 24px" }}>
              <h3 style={{ fontSize: "18px" }}>Active & Closed Exam Papers</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>Share invitation links or view student scores and cheating flags.</p>
            </div>
            
            {exams.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                <p style={{ marginBottom: "16px" }}>You have not created any exam papers yet.</p>
                <button onClick={() => router.push("/dashboard/create")} className="btn btn-primary" style={{ margin: "0 auto" }}>
                  <Plus size={16} /> Create Your First Exam
                </button>
              </div>
            ) : (
              <div className="custom-table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Exam Paper</th>
                      <th>Submissions</th>
                      <th>Time Limit</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => {
                      const examSubmissions = submissions.filter(sub => sub.examId === exam.id);
                      const activeSubmissionsCount = examSubmissions.length;
                      
                      return (
                        <tr key={exam.id}>
                          <td>
                            <div style={{ fontWeight: "700", fontSize: "15px" }}>{exam.title}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                              Code: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontWeight: "600" }}>{exam.id}</span> • {exam.questions?.length || 0} Questions
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{activeSubmissionsCount} submissions</div>
                          </td>
                          <td>
                            <div style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{exam.duration} mins</div>
                          </td>
                          <td>
                            <span className={`badge badge-${exam.status || 'active'}`}>
                              {exam.status || 'active'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                              <button 
                                onClick={() => router.push(`/dashboard/exam/${exam.id}`)}
                                className="btn btn-secondary" 
                                style={{ padding: "6px 12px", gap: "4px", fontSize: "13px" }}
                                title="View Analytics"
                              >
                                <Eye size={14} />
                                Analyze
                              </button>
                              
                              <button 
                                onClick={() => copyExamLink(exam.id)}
                                className="btn btn-secondary" 
                                style={{ padding: "6px 12px", gap: "4px", fontSize: "13px", minWidth: "115px" }}
                              >
                                {copiedId === exam.id ? (
                                  <>
                                    <Check size={14} style={{ color: "var(--success)" }} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Share2 size={14} />
                                    Invite Link
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => toggleStatus(exam.id, exam.status || 'active')}
                                className="btn btn-secondary"
                                style={{ 
                                  padding: "6px 12px", 
                                  fontSize: "13px",
                                  color: exam.status === "closed" ? "var(--success)" : "var(--warning)"
                                }}
                              >
                                {exam.status === "closed" ? "Open" : "Close"}
                              </button>

                              <button
                                onClick={() => deleteExam(exam.id)}
                                className="btn btn-secondary"
                                style={{ 
                                  padding: "6px 12px", 
                                  color: "var(--danger)",
                                  borderColor: "rgba(225, 29, 72, 0.2)"
                                }}
                                title="Delete Exam"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "2px solid var(--border-color)", padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", background: "white", marginTop: "auto" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>&copy; {new Date().getFullYear()} Genx Exam. All rights reserved.</span>
          <span>
            Developed by <a href="https://www.instantpages.site/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>instant pages</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
