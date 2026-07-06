"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Save, Code, ListPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function CreateExam() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Exam metadata state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  
  // Questions list state
  const [questions, setQuestions] = useState([
    {
      id: "q-1",
      text: "",
      type: "mcq",
      points: 5,
      options: ["", ""],
      correctAnswer: "",
      language: "javascript", // For code type questions
      codeTemplate: "",
      testCases: [{ input: "", output: "" }],
      topic: ""
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading, mounted, router]);

  const addQuestion = (type = "mcq") => {
    const newId = `q-${Date.now()}`;
    const baseQuestion = {
      id: newId,
      text: "",
      type,
      points: 5,
      topic: "",
    };

    if (type === "mcq" || type === "checkbox") {
      baseQuestion.options = ["", ""];
      baseQuestion.correctAnswer = type === "mcq" ? "" : [];
    } else if (type === "text") {
      baseQuestion.correctAnswer = "";
    } else if (type === "code") {
      baseQuestion.language = "javascript";
      baseQuestion.codeTemplate = getDefaultCodeTemplate("javascript");
      baseQuestion.testCases = [{ input: "2 3", output: "5" }];
      baseQuestion.correctAnswer = "";
    }

    setQuestions([...questions, baseQuestion]);
  };

  const getDefaultCodeTemplate = (lang) => {
    if (lang === "cpp") {
      return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read from standard input (cin)\n    int a, b;\n    if (cin >> a >> b) {\n        // Print solution to standard output (cout)\n        cout << (a + b) << endl;\n    }\n    return 0;\n}`;
    }
    if (lang === "java") {
      return `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Read from standard input\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int a = scanner.nextInt();\n            int b = scanner.nextInt();\n            // Print solution to standard output\n            System.out.println(a + b);\n        }\n    }\n}`;
    }
    // Javascript
    return `// Read from standard input\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0]);\n    const b = parseInt(input[1]);\n    // Print solution to standard output (console.log)\n    console.log(a + b);\n}`;
  };

  const removeQuestion = (qId) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const updateQuestionText = (qId, text) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));
  };

  const updateQuestionPoints = (qId, points) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, points: Number(points) } : q));
  };

  const updateQuestionTopic = (qId, topic) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, topic } : q));
  };

  const updateQuestionType = (qId, type) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      
      const updated = { ...q, type };
      if (type === "mcq" || type === "checkbox") {
        updated.options = q.options || ["", ""];
        updated.correctAnswer = type === "mcq" ? "" : [];
      } else if (type === "text") {
        updated.correctAnswer = "";
      } else if (type === "code") {
        updated.language = q.language || "javascript";
        updated.codeTemplate = q.codeTemplate || getDefaultCodeTemplate(updated.language);
        updated.testCases = q.testCases || [{ input: "2 3", output: "5" }];
      }
      return updated;
    }));
  };

  const updateQuestionLanguage = (qId, language) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        language,
        codeTemplate: getDefaultCodeTemplate(language)
      };
    }));
  };

  // Option actions (for MCQ / Checkbox)
  const addOption = (qId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: [...q.options, ""] };
    }));
  };

  const removeOption = (qId, optionIndex) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      if (q.options.length <= 2) return q;
      
      const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
      
      let newCorrect = q.correctAnswer;
      if (q.type === "mcq") {
        if (Number(q.correctAnswer) === optionIndex) {
          newCorrect = "";
        } else if (Number(q.correctAnswer) > optionIndex) {
          newCorrect = String(Number(q.correctAnswer) - 1);
        }
      } else {
        newCorrect = q.correctAnswer
          .filter(idx => idx !== optionIndex)
          .map(idx => idx > optionIndex ? idx - 1 : idx);
      }

      return { ...q, options: newOptions, correctAnswer: newCorrect };
    }));
  };

  const updateOptionText = (qId, optionIndex, text) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[optionIndex] = text;
      return { ...q, options: newOptions };
    }));
  };

  const setMCQCorrect = (qId, optionIndex) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, correctAnswer: String(optionIndex) };
    }));
  };

  const toggleCheckboxCorrect = (qId, optionIndex) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const currentArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
      const newArr = currentArr.includes(optionIndex)
        ? currentArr.filter(idx => idx !== optionIndex)
        : [...currentArr, optionIndex];
      return { ...q, correctAnswer: newArr };
    }));
  };

  // Test case actions (for Code questions)
  const addTestCase = (qId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, testCases: [...q.testCases, { input: "", output: "" }] };
    }));
  };

  const removeTestCase = (qId, testCaseIndex) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      if (q.testCases.length <= 1) return q;
      return { ...q, testCases: q.testCases.filter((_, idx) => idx !== testCaseIndex) };
    }));
  };

  const updateTestCase = (qId, index, key, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const newCases = [...q.testCases];
      newCases[index] = { ...newCases[index], [key]: value };
      return { ...q, testCases: newCases };
    }));
  };

  const updateCodeTemplate = (qId, template) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, codeTemplate: template } : q));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Exam Paper Title is required.");
      return;
    }
    if (duration <= 0) {
      setError("Time limit must be a positive number.");
      return;
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} has empty question text.`);
        return;
      }
      
      if (!q.topic.trim()) {
        setError(`Question ${i + 1} needs an assessment Topic tag.`);
        return;
      }

      if (q.type === "mcq" && q.correctAnswer === "") {
        setError(`Question ${i + 1} (MCQ) must select a correct option.`);
        return;
      }

      if (q.type === "checkbox" && (!q.correctAnswer || q.correctAnswer.length === 0)) {
        setError(`Question ${i + 1} (Multi-Select) must check at least one correct option.`);
        return;
      }

      if (q.type === "text" && !q.correctAnswer.trim()) {
        setError(`Question ${i + 1} (Short Answer) requires an answer string.`);
        return;
      }

      if (q.type === "mcq" || q.type === "checkbox") {
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) {
            setError(`Question ${i + 1} option ${j + 1} cannot be empty.`);
            return;
          }
        }
      }

      if (q.type === "code") {
        for (let j = 0; j < q.testCases.length; j++) {
          const tc = q.testCases[j];
          if (tc.input.trim() === "" || tc.output.trim() === "") {
            setError(`Question ${i + 1} compiler testcase ${j + 1} requires both stdin and expected stdout.`);
            return;
          }
        }
      }
    }

    setError("");
    setSaving(true);

    try {
      const examData = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        showScoreImmediately,
        status: "active",
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        questions: questions.map(q => {
          const formattedQuestion = {
            id: q.id,
            text: q.text.trim(),
            type: q.type,
            points: q.points,
            topic: q.topic.trim().toLowerCase()
          };

          if (q.type === "mcq" || q.type === "checkbox") {
            formattedQuestion.options = q.options.map(opt => opt.trim());
            formattedQuestion.correctAnswer = q.correctAnswer;
          } else if (q.type === "text") {
            formattedQuestion.correctAnswer = q.correctAnswer.trim();
          } else if (q.type === "code") {
            formattedQuestion.language = q.language;
            formattedQuestion.codeTemplate = q.codeTemplate;
            formattedQuestion.testCases = q.testCases.map(tc => ({
              input: tc.input.trim(), // stdin
              output: tc.output.trim() // stdout
            }));
            formattedQuestion.correctAnswer = "";
          }

          return formattedQuestion;
        })
      };

      await addDoc(collection(db, "exams"), examData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating exam:", err);
      setError("Failed to create exam. Verify database connectivity.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || authLoading) return null;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <header className="app-header">
        <div className="container nav-container">
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => router.push("/dashboard")}>
            <BookOpen size={26} style={{ color: "var(--primary)" }} />
            Genx Exam
          </div>
          <button onClick={() => router.push("/dashboard")} className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Creator Form */}
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px" }}>Create New Exam Paper</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Design question parameters, select test runners, and configure rules.</p>
            </div>
            <button onClick={handleSave} className="btn btn-primary" style={{ gap: "8px" }} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving Sheet..." : "Save & Activate"}
            </button>
          </div>

          {error && (
            <div style={{ 
              background: "var(--danger-light)", 
              color: "var(--danger)", 
              padding: "16px", 
              borderRadius: "10px", 
              fontSize: "14px", 
              marginBottom: "32px",
              border: "2px solid var(--danger)"
            }}>
              {error}
            </div>
          )}

          {/* Exam Configuration Card */}
          <div className="glass-card" style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "20px", borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>
              Exam Cover Configuration
            </h3>
            
            <div className="form-group">
              <label className="form-label">Exam Paper Title *</label>
              <input
                type="text"
                placeholder="E.g., CS101: Midterm Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Student Instructions</label>
              <textarea
                placeholder="Write specific guidelines, formulas allowed, or code formatting directions."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div className="form-group" style={{ flex: 1, minWidth: "150px" }}>
                <label className="form-label">Time Limit (Minutes) *</label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 2, minWidth: "250px", justifyContent: "center" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    checked={showScoreImmediately}
                    onChange={(e) => setShowScoreImmediately(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  Release score and correction feedback immediately after submission
                </label>
              </div>
            </div>
          </div>

          {/* Dynamic Question Builder */}
          <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Questions Registry</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {questions.map((q, index) => (
              <div className="glass-card" key={q.id} style={{ position: "relative", borderLeft: "6px solid var(--primary)" }}>
                
                {/* Header question # & Delete button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "800", textTransform: "uppercase", color: "var(--primary)" }}>
                    Question #{index + 1}
                  </span>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="form-label" style={{ margin: 0 }}>Points:</span>
                      <input
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={(e) => updateQuestionPoints(q.id, e.target.value)}
                        className="form-input"
                        style={{ width: "70px", padding: "6px 8px" }}
                      />
                    </div>

                    <button 
                      onClick={() => removeQuestion(q.id)}
                      className="btn btn-secondary"
                      style={{ padding: "8px", color: "var(--danger)", borderColor: "rgba(225, 29, 72, 0.2)", boxShadow: "none" }}
                      disabled={questions.length === 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Question Type Selector & Topic */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <div className="form-group" style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}>
                    <label className="form-label">Evaluation Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestionType(q.id, e.target.value)}
                      className="form-select"
                    >
                      <option value="mcq">Multiple Choice (Single Option)</option>
                      <option value="checkbox">Multiple Select (Checkboxes)</option>
                      <option value="text">Written Short Answer</option>
                      <option value="code">Compiler / Sandbox Code Question</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, minWidth: "200px", marginBottom: 0 }}>
                    <label className="form-label">Weakness Tag (Topic) *</label>
                    <input
                      type="text"
                      placeholder="E.g., Arrays, Functions, Fractions"
                      value={q.topic}
                      onChange={(e) => updateQuestionTopic(q.id, e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div className="form-group" style={{ margin: "16px 0 20px 0" }}>
                  <label className="form-label">Question Prompt *</label>
                  <textarea
                    placeholder="E.g., Write a C++ program that reads two numbers from stdin and prints their sum."
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    className="form-textarea"
                    rows={2}
                    required
                  />
                </div>

                {/* MCQ & Checkbox Options Rendering */}
                {(q.type === "mcq" || q.type === "checkbox") && (
                  <div style={{ marginBottom: "20px" }}>
                    <label className="form-label" style={{ marginBottom: "10px", display: "block" }}>Options (Check correct checkbox/circle)</label>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          
                          {q.type === "mcq" ? (
                            <button
                              type="button"
                              onClick={() => setMCQCorrect(q.id, optIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: String(q.correctAnswer) === String(optIdx) ? "var(--success)" : "var(--text-muted)" }}
                            >
                              {String(q.correctAnswer) === String(optIdx) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleCheckboxCorrect(q.id, optIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optIdx) ? "var(--success)" : "var(--text-muted)" }}
                            >
                              {Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optIdx) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                          )}

                          <input
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => updateOptionText(q.id, optIdx, e.target.value)}
                            className="form-input"
                            style={{ flex: 1, padding: "8px 12px" }}
                            required
                          />

                          <button 
                            type="button"
                            onClick={() => removeOption(q.id, optIdx)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="btn btn-secondary"
                      style={{ marginTop: "12px", padding: "6px 12px", fontSize: "13px", gap: "6px" }}
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  </div>
                )}

                {/* Short Answer Exact Input Rendering */}
                {q.type === "text" && (
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">Correct Answer Match *</label>
                    <input
                      type="text"
                      placeholder="E.g., final"
                      value={q.correctAnswer}
                      onChange={(e) => setQuestions(prev => prev.map(qi => qi.id === q.id ? { ...qi, correctAnswer: e.target.value } : qi))}
                      className="form-input"
                      required
                    />
                    <small style={{ color: "var(--text-muted)", fontSize: "11px", textAlign: "left" }}>Checks answers case-insensitively with trimmed white spaces.</small>
                  </div>
                )}

                {/* Compiler / Code Question Rendering */}
                {q.type === "code" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                    
                    {/* Language Selector */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Target Compiler Language *</label>
                      <select
                        value={q.language || "javascript"}
                        onChange={(e) => updateQuestionLanguage(q.id, e.target.value)}
                        className="form-select"
                        style={{ width: "200px" }}
                      >
                        <option value="javascript">JavaScript (NodeJS)</option>
                        <option value="cpp">C++ (GCC 10.2.0)</option>
                        <option value="java">Java (OpenJDK 15)</option>
                      </select>
                    </div>

                    {/* Code Template */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Code size={16} /> Starter Code Template
                      </label>
                      <textarea
                        value={q.codeTemplate}
                        onChange={(e) => updateCodeTemplate(q.id, e.target.value)}
                        className="form-textarea"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                        rows={6}
                      />
                    </div>

                    {/* Test Cases */}
                    <div>
                      <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <ListPlus size={16} /> Standard Test Cases (I/O Redirection) *
                      </label>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {q.testCases.map((tc, tcIdx) => (
                          <div key={tcIdx} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                            
                            <div style={{ flex: 1 }}>
                              <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px", textAlign: "left" }}>Standard Input (stdin)</small>
                              <textarea
                                placeholder='E.g. 2 3'
                                value={tc.input}
                                onChange={(e) => updateTestCase(q.id, tcIdx, "input", e.target.value)}
                                className="form-input"
                                style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "13px", height: "40px", resize: "none" }}
                                required
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "2px", textAlign: "left" }}>Expected Output (stdout)</small>
                              <textarea
                                placeholder='E.g. 5'
                                value={tc.output}
                                onChange={(e) => updateTestCase(q.id, tcIdx, "output", e.target.value)}
                                className="form-input"
                                style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "13px", height: "40px", resize: "none" }}
                                required
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeTestCase(q.id, tcIdx)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", marginBottom: "12px" }}
                              disabled={q.testCases.length <= 1}
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addTestCase(q.id)}
                        className="btn btn-secondary"
                        style={{ marginTop: "12px", padding: "6px 12px", fontSize: "13px", gap: "6px" }}
                      >
                        <Plus size={14} />
                        Add Test Case
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Add Question Controls */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-start", flexWrap: "wrap" }}>
            <button onClick={() => addQuestion("mcq")} className="btn btn-secondary" style={{ gap: "6px" }}>
              <Plus size={16} /> MCQ Question
            </button>
            <button onClick={() => addQuestion("checkbox")} className="btn btn-secondary" style={{ gap: "6px" }}>
              <Plus size={16} /> Multi-Select
            </button>
            <button onClick={() => addQuestion("text")} className="btn btn-secondary" style={{ gap: "6px" }}>
              <Plus size={16} /> Short Written
            </button>
            <button onClick={() => addQuestion("code")} className="btn btn-secondary" style={{ gap: "6px" }}>
              <Plus size={16} /> Coding Sandbox
            </button>
          </div>

          <div style={{ borderTop: "2px solid var(--border-color)", marginTop: "40px", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ height: "46px", padding: "0 28px", gap: "8px" }} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving Exam Paper..." : "Activate Exam Paper"}
            </button>
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
