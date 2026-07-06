"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Play, Code, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";

function ExamRoom() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id;
  const submissionId = searchParams.get("submissionId");

  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exam taking state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timePerQuestion, setTimePerQuestion] = useState({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

  // Code editor runner states
  const [codeConsole, setCodeConsole] = useState({});
  const [codeRunning, setCodeRunning] = useState({});

  // Hydration check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const timerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Load exam and submission
  useEffect(() => {
    if (!examId || !submissionId || !mounted) {
      if (mounted && (!examId || !submissionId)) {
        setError("Invalid URL parameters. Missing exam session identifier.");
        setLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      try {
        const subSnap = await getDoc(doc(db, "submissions", submissionId));
        if (!subSnap.exists()) {
          setError("Submission session not found.");
          setLoading(false);
          return;
        }

        const subData = subSnap.data();
        if (subData.status !== "started") {
          router.replace(`/exam/${examId}/result/${submissionId}`);
          return;
        }

        const examSnap = await getDoc(doc(db, "exams", examId));
        if (!examSnap.exists()) {
          setError("Exam details not found.");
          setLoading(false);
          return;
        }

        const examData = examSnap.data();
        setExam(examData);
        setSubmission(subData);

        // Load saved progress
        setAnswers(subData.answers || {});
        setTimePerQuestion(subData.timePerQuestion || {});
        setTabSwitches(subData.tabSwitches || 0);

        // Calculate time
        const startMillis = subData.startedAt?.toMillis() || Date.now();
        const elapsedSeconds = Math.floor((Date.now() - startMillis) / 1000);
        const durationSeconds = examData.duration * 60;
        const remaining = Math.max(0, durationSeconds - elapsedSeconds);

        setTimeLeft(remaining);
        
        // Initialize template
        const initialAnswers = { ...(subData.answers || {}) };
        examData.questions.forEach(q => {
          if (q.type === "code" && !initialAnswers[q.id]) {
            initialAnswers[q.id] = q.codeTemplate || "";
          }
        });
        setAnswers(initialAnswers);

      } catch (err) {
        console.error("Error loading exam room:", err);
        setError("Failed to fetch exam content.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, submissionId, mounted, router]);

  // Anti-cheat: Track visibility/blur events
  useEffect(() => {
    if (loading || error || !exam || !mounted) return;

    const handleFocusBlur = () => {
      logTabSwitch();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logTabSwitch();
      }
    };

    const logTabSwitch = async () => {
      setTabSwitches(prev => {
        const newVal = prev + 1;
        const subRef = doc(db, "submissions", submissionId);
        updateDoc(subRef, { tabSwitches: newVal }).catch(err => console.error(err));
        return newVal;
      });

      setWarningMessage("SECURITY WARNING: You switched browser tabs or windows! Shifting browser focus during exams is flagged and sent to your instructor. Please return to your sheet.");
    };

    window.addEventListener("blur", handleFocusBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleFocusBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, error, exam, submissionId, mounted]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || loading || error || !mounted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      if (exam?.questions && exam.questions[currentIdx]) {
        const currentQId = exam.questions[currentIdx].id;
        setTimePerQuestion(prev => ({
          ...prev,
          [currentQId]: (prev[currentQId] || 0) + 1
        }));
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, currentIdx, exam, loading, error, mounted]);

  // Auto-save
  useEffect(() => {
    if (loading || error || !mounted) return;

    autoSaveTimerRef.current = setInterval(() => {
      saveProgressBackground();
    }, 15000);

    return () => clearInterval(autoSaveTimerRef.current);
  }, [answers, timePerQuestion, tabSwitches, loading, error, mounted]);

  const saveProgressBackground = async () => {
    if (!submissionId) return;
    try {
      const subRef = doc(db, "submissions", submissionId);
      await updateDoc(subRef, {
        answers,
        timePerQuestion,
        tabSwitches
      });
    } catch (err) {
      console.warn("Background auto-save failed:", err);
    }
  };

  const handleMCQSelect = (qId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: String(optionIdx)
    }));
  };

  const handleCheckboxToggle = (qId, optionIdx) => {
    setAnswers(prev => {
      const currentList = Array.isArray(prev[qId]) ? prev[qId] : [];
      const newList = currentList.includes(optionIdx)
        ? currentList.filter(idx => idx !== optionIdx)
        : [...currentList, optionIdx];
      return {
        ...prev,
        [qId]: newList
      };
    });
  };

  const handleTextChange = (qId, text) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  // Piston API Sandbox execution for Javascript, C++, Java
  const runCode = async (qId, codeString, testCases, language) => {
    setCodeRunning(prev => ({ ...prev, [qId]: true }));
    setCodeConsole(prev => ({ ...prev, [qId]: "Compiling code and executing test cases on Genx Sandbox servers..." }));
    
    try {
      const results = [];
      let allPassed = true;

      for (let idx = 0; idx < testCases.length; idx++) {
        const tc = testCases[idx];
        
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language === "javascript" ? "js" : language,
            version: "*",
            files: [
              {
                name: language === "java" ? "Main.java" : language === "cpp" ? "main.cpp" : "main.js",
                content: codeString
              }
            ],
            stdin: tc.input
          })
        });

        if (!res.ok) {
          throw new Error("Sandbox server returned error response.");
        }

        const data = await res.json();
        
        if (data.run.stderr) {
          allPassed = false;
          results.push({
            index: idx + 1,
            passed: false,
            error: data.run.stderr
          });
        } else {
          const actualStr = (data.run.stdout || "").trim().toLowerCase();
          const expectedStr = tc.output.trim().toLowerCase();
          const passed = actualStr === expectedStr;
          
          if (!passed) allPassed = false;
          results.push({
            index: idx + 1,
            passed,
            actual: data.run.stdout || "",
            expected: tc.output
          });
        }
      }

      const consoleLog = results.map(r => {
        if (r.error) {
          return `Test Case ${r.index}: Failed ❌\n  Runtime/Compiler Error:\n  ${r.error}`;
        }
        return `Test Case ${r.index}: ${r.passed ? "PASSED ✅" : "FAILED ❌"}\n  Input (stdin): ${testCases[r.index-1].input || "None"}\n  Expected: ${r.expected}\n  Received: ${r.actual}`;
      }).join("\n\n");

      setCodeConsole(prev => ({ 
        ...prev, 
        [qId]: `${allPassed ? "🎉 SUCCESS: All test cases passed!\n\n" : "⚠️ FAILED: Some test cases failed.\n\n"}${consoleLog}`
      }));

    } catch (err) {
      setCodeConsole(prev => ({ ...prev, [qId]: `Sandbox Connection Error: ${err.message}` }));
    } finally {
      setCodeRunning(prev => ({ ...prev, [qId]: false }));
    }
  };

  const handleAutoSubmit = async () => {
    await submitExam(true);
  };

  const submitExam = async (isTimeout = false) => {
    setLoading(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveTimerRef.current);

    try {
      let finalScore = 0;
      
      // Submit evaluations
      for (let i = 0; i < exam.questions.length; i++) {
        const q = exam.questions[i];
        const studentAns = answers[q.id];
        if (!studentAns) continue;

        if (q.type === "mcq") {
          if (String(studentAns) === String(q.correctAnswer)) {
            finalScore += q.points;
          }
        } 
        else if (q.type === "checkbox") {
          const ansArr = Array.isArray(studentAns) ? studentAns.map(Number).sort() : [];
          const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer.map(Number).sort() : [];
          const matches = ansArr.length === correctArr.length && ansArr.every((v, i) => v === correctArr[i]);
          if (matches) {
            finalScore += q.points;
          }
        } 
        else if (q.type === "text") {
          if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
            finalScore += q.points;
          }
        } 
        else if (q.type === "code") {
          let allPassed = true;
          
          for (let j = 0; j < q.testCases.length; j++) {
            const tc = q.testCases[j];
            try {
              const res = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  language: q.language === "javascript" ? "js" : q.language,
                  version: "*",
                  files: [{
                    name: q.language === "java" ? "Main.java" : q.language === "cpp" ? "main.cpp" : "main.js",
                    content: studentAns
                  }],
                  stdin: tc.input
                })
              });

              if (!res.ok) {
                allPassed = false;
                break;
              }

              const data = await res.json();
              if (data.run.stderr) {
                allPassed = false;
                break;
              }

              const actualStr = (data.run.stdout || "").trim().toLowerCase();
              const expectedStr = tc.output.trim().toLowerCase();
              if (actualStr !== expectedStr) {
                allPassed = false;
                break;
              }
            } catch (e) {
              allPassed = false;
              break;
            }
          }

          if (allPassed && q.testCases.length > 0) {
            finalScore += q.points;
          }
        }
      }

      const subRef = doc(db, "submissions", submissionId);
      await updateDoc(subRef, {
        answers,
        timePerQuestion,
        tabSwitches,
        status: isTimeout ? "timed_out" : "submitted",
        score: finalScore,
        submittedAt: serverTimestamp()
      });

      router.replace(`/exam/${examId}/result/${submissionId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to save final responses. Check networks.");
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
        <p style={{ color: "var(--text-secondary)" }}>Configuring exam sheet...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", padding: "20px" }}>
        <div className="glass-card" style={{ maxWidth: "450px", textAlign: "center" }}>
          <AlertTriangle size={48} style={{ color: "var(--danger)", marginBottom: "16px" }} />
          <h2>Assessment Access Error</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "14px" }}>{error}</p>
          <button onClick={() => router.push("/")} className="btn btn-primary" style={{ marginTop: "24px" }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const isTimeUrgent = timeLeft < 300;
  const isTimeCritical = timeLeft < 60;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Warnings Popup Overlay */}
      {warningMessage && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass-card" style={{ maxWidth: "450px", textAlign: "center", border: "3px solid var(--danger)", boxShadow: "var(--shadow-solid)" }}>
            <AlertCircle size={56} style={{ color: "var(--danger)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "20px", color: "var(--danger)" }}>Cheating Check Warning</h3>
            <p style={{ color: "var(--text-primary)", fontSize: "14px", marginTop: "12px", lineHeight: "1.6", textAlign: "left" }}>
              {warningMessage}
            </p>
            <button 
              onClick={() => setWarningMessage("")} 
              className="btn btn-danger" 
              style={{ marginTop: "24px", width: "100%" }}
            >
              I Understand. Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Top sticky exam bar */}
      <header className="app-header">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <BookOpen size={18} style={{ color: "var(--primary)" }} />
              {exam.title}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px", textAlign: "left" }}>
              Candidate: <strong style={{ color: "var(--text-secondary)" }}>{submission.studentName}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: isTimeCritical ? "var(--danger-light)" : isTimeUrgent ? "var(--warning-light)" : "var(--bg-secondary)",
              color: isTimeCritical ? "var(--danger)" : isTimeUrgent ? "var(--warning)" : "var(--text-primary)",
              border: "2px solid var(--border-color)",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "800",
              fontFamily: "var(--font-mono)",
              fontSize: "15px"
            }}>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>

            <button onClick={() => {
              if (confirm("Are you sure you want to submit your exam now? Your answers will be graded immediately.")) {
                submitExam(false);
              }
            }} className="btn btn-success" style={{ padding: "8px 16px" }}>
              Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Main Exam environment body */}
      <main style={{ flex: 1, padding: "30px 0" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          
          {/* Question Navigator */}
          <div className="glass-card" style={{ padding: "16px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginRight: "8px" }}>
              Questions:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "" && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
                
                let border = "1.5px solid var(--border-color-light)";
                let background = "white";
                let color = "var(--text-secondary)";

                if (isCurrent) {
                  border = "2px solid var(--primary)";
                  background = "var(--primary-light)";
                  color = "var(--primary)";
                } else if (isAnswered) {
                  background = "var(--success-light)";
                  border = "1.5px solid var(--success)";
                  color = "var(--success)";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      border,
                      background,
                      color,
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question card */}
          {currentQuestion && (
            <div className="glass-card" style={{ padding: "32px", minHeight: "400px" }}>
              
              {/* Question header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "2px solid var(--border-color)", paddingBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>
                    Question {currentIdx + 1} of {exam.questions.length} • {currentQuestion.type === "code" ? `${currentQuestion.language.toUpperCase()} COMPILER` : currentQuestion.type.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: "20px", marginTop: "4px", fontWeight: "700" }}>{currentQuestion.text}</h3>
                </div>
                <div style={{ background: "var(--bg-secondary)", border: "2px solid var(--border-color)", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", flexShrink: 0 }}>
                  {currentQuestion.points} Points
                </div>
              </div>

              {/* Input details */}
              <div style={{ margin: "24px 0" }}>

                {/* MCQ Question */}
                {currentQuestion.type === "mcq" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = String(answers[currentQuestion.id]) === String(optIdx);
                      return (
                        <div 
                          key={optIdx}
                          onClick={() => handleMCQSelect(currentQuestion.id, optIdx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "16px",
                            background: isSelected ? "var(--primary-light)" : "white",
                            border: "2px solid var(--border-color)",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected ? "2px 2px 0px 0px var(--border-color)" : "none"
                          }}
                        >
                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: isSelected ? "6px solid var(--primary)" : "2px solid var(--border-color-light)",
                            background: "white",
                            flexShrink: 0
                          }}></div>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Checkbox Question */}
                {currentQuestion.type === "checkbox" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const ansList = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                      const isSelected = ansList.includes(optIdx);
                      return (
                        <div 
                          key={optIdx}
                          onClick={() => handleCheckboxToggle(currentQuestion.id, optIdx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "16px",
                            background: isSelected ? "var(--primary-light)" : "white",
                            border: "2px solid var(--border-color)",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected ? "2px 2px 0px 0px var(--border-color)" : "none"
                          }}
                        >
                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: "2px solid var(--border-color)",
                            background: isSelected ? "var(--primary)" : "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold",
                            flexShrink: 0
                          }}>
                            {isSelected && "✓"}
                          </div>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text Question */}
                {currentQuestion.type === "text" && (
                  <div className="form-group">
                    <label className="form-label">Type your answer below *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter short answer here"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                    />
                  </div>
                )}

                {/* Sandbox Code Question */}
                {currentQuestion.type === "code" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="code-editor-container">
                      <div className="code-editor-header">
                        <span>Compiler: {currentQuestion.language.toUpperCase()} (Online Execution)</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                          {currentQuestion.language === "java" ? "Main.java" : currentQuestion.language === "cpp" ? "main.cpp" : "solution.js"}
                        </span>
                      </div>
                      <div className="code-editor-body">
                        <textarea
                          className="code-editor-textarea"
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                          placeholder="// Write code here"
                        />
                      </div>
                      
                      <div style={{ padding: "10px 16px", background: "#334155", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => runCode(currentQuestion.id, answers[currentQuestion.id] || "", currentQuestion.testCases, currentQuestion.language)}
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "13px", gap: "6px" }}
                          disabled={codeRunning[currentQuestion.id]}
                        >
                          <Play size={14} />
                          {codeRunning[currentQuestion.id] ? "Running..." : "Compile & Run Tests"}
                        </button>
                      </div>

                      <div className="code-editor-output">
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px", textAlign: "left" }}>
                          Terminal Output:
                        </div>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", textAlign: "left" }}>
                          {codeConsole[currentQuestion.id] || `Online Compiler initialized. Writes logs to stdout.\nSelect compiler input test cases defined by examiner.`}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", borderTop: "2px solid var(--border-color)", paddingTop: "24px" }}>
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className="btn btn-secondary"
                  disabled={currentIdx === 0}
                  style={{ gap: "6px" }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {currentIdx < exam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(exam.questions.length - 1, prev + 1))}
                    className="btn btn-secondary"
                    style={{ gap: "6px" }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm("You have reached the end. Submit the exam sheet now?")) {
                        submitExam(false);
                      }
                    }}
                    className="btn btn-success"
                    style={{ gap: "8px" }}
                  >
                    <CheckCircle2 size={16} />
                    Submit Exam Sheet
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function TakeExamPage() {
  return (
    <Suspense fallback={
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>Configuring examination room...</p>
      </div>
    }>
      <ExamRoom />
    </Suspense>
  );
}
