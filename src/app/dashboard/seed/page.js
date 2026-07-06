"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, ShieldAlert, Award, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function Seeder() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading, router]);

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    setError("");

    try {
      const examData = {
        title: "ICSE Class X - Computer Applications (Java) Model Exam",
        description: "Full Syllabus Practice Test covering Revision of Class IX, Library Classes, Arrays, String Handling, Recursion, and Constructors.",
        duration: 180, // 3 Hours
        showScoreImmediately: true,
        status: "active",
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        questions: [
          // Section A: MCQs
          {
            id: "q-a1",
            text: "Which of the following is NOT a fundamental feature of Object Oriented Programming?",
            type: "mcq",
            points: 5,
            topic: "oop",
            options: [
              "Encapsulation",
              "Polymorphism",
              "Purely linear, top-to-bottom execution",
              "Inheritance"
            ],
            correctAnswer: "2"
          },
          {
            id: "q-a2",
            text: "Java is best described as a language that is:",
            type: "mcq",
            points: 5,
            topic: "java basics",
            options: [
              "Purely compiled",
              "Purely interpreted",
              "Both compiled and interpreted",
              "Neither compiled nor interpreted"
            ],
            correctAnswer: "2"
          },
          {
            id: "q-a3",
            text: "The default value of a boolean instance variable in Java is:",
            type: "mcq",
            points: 5,
            topic: "variables",
            options: [
              "true",
              "false",
              "0",
              "null"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a4",
            text: "What will System.out.println(17 / 4); print?",
            type: "mcq",
            points: 5,
            topic: "math",
            options: [
              "4",
              "4.25",
              "1",
              "Compile-time error"
            ],
            correctAnswer: "0"
          },
          {
            id: "q-a5",
            text: "The wrapper class corresponding to the primitive type int is:",
            type: "mcq",
            points: 5,
            topic: "library classes",
            options: [
              "Int",
              "Integer",
              "INT",
              "Integers"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a6",
            text: "Which Math class method returns the absolute value of a number?",
            type: "mcq",
            points: 5,
            topic: "library classes",
            options: [
              "Math.abs()",
              "Math.fabs()",
              "Math.mod()",
              "Math.absolute()"
            ],
            correctAnswer: "0"
          },
          {
            id: "q-a7",
            text: "In a switch statement, which keyword is used to prevent execution from continuing (falling through) into the next case?",
            type: "mcq",
            points: 5,
            topic: "conditionals",
            options: [
              "exit",
              "stop",
              "break",
              "return"
            ],
            correctAnswer: "2"
          },
          {
            id: "q-a8",
            text: "Which loop is guaranteed to execute its body at least once, even if the test condition is initially false?",
            type: "mcq",
            points: 5,
            topic: "loops",
            options: [
              "for loop",
              "while loop",
              "do-while loop",
              "nested for loop"
            ],
            correctAnswer: "2"
          },
          {
            id: "q-a9",
            text: "Which of the following correctly declares and creates a 2-dimensional array of 2 rows and 3 columns?",
            type: "mcq",
            points: 5,
            topic: "arrays",
            options: [
              "int arr[2][3];",
              "int[][] arr = new int[2][3];",
              "int arr = new int[2,3];",
              "array arr[2][3];"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a10",
            text: "The index of the first element of an array in Java is:",
            type: "mcq",
            points: 5,
            topic: "arrays",
            options: [
              "-1",
              "0",
              "1",
              "It depends on the declaration"
            ],
            correctAnswer: "1"
          },
          
          // Section B: Output Questions (Short text answer)
          {
            id: "q-b1",
            text: "What does \"Cognitive\".charAt(1) return?",
            type: "text",
            points: 10,
            topic: "strings",
            correctAnswer: "o"
          },
          {
            id: "q-b2",
            text: "Which String method converts all characters of a string to lower case?",
            type: "text",
            points: 10,
            topic: "strings",
            correctAnswer: "toLowerCase()"
          },
          {
            id: "q-b3",
            text: "What is returned by the expression Integer.parseInt(\"36\")?",
            type: "text",
            points: 10,
            topic: "library classes",
            correctAnswer: "36"
          },

          // Section C: Java Compilers
          {
            id: "q-c1",
            text: "Write a recursive Java program to read an integer n from standard input (stdin) and print its Factorial to standard output (stdout). (Example: n = 5 -> 120).",
            type: "code",
            points: 20,
            topic: "recursion",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    static int fact(int n) {\n        if (n <= 1) return 1;\n        return n * fact(n - 1);\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int n = scanner.nextInt();\n            System.out.println(fact(n));\n        }\n    }\n}`,
            testCases: [
              { input: "5", output: "120" },
              { input: "3", output: "6" },
              { input: "1", output: "1" }
            ]
          },
          {
            id: "q-c2",
            text: "Write a Java program to check if an integer is a Duck Number. A Duck Number is a positive number which has one or more zeroes present in it, but does not begin with a zero. The program should read N from stdin and print 'DUCK' if it is a duck number, and 'NOT DUCK' otherwise.",
            type: "code",
            points: 20,
            topic: "library classes",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNext()) {\n            String s = scanner.next();\n            if (s.charAt(0) != '0' && s.indexOf('0') != -1) {\n                System.out.println("DUCK");\n            } else {\n                System.out.println("NOT DUCK");\n            }\n        }\n    }\n}`,
            testCases: [
              { input: "3702", output: "DUCK" },
              { input: "0450", output: "NOT DUCK" },
              { input: "8907", output: "DUCK" },
              { input: "1234", output: "NOT DUCK" }
            ]
          },
          {
            id: "q-c3",
            text: "Write a Java program to encrypt a single word using Caesar Cipher. Shift every alphabet forward by a key. The program should read a word and an integer key (space-separated) from stdin and print the encrypted word to stdout. (Example: 'Hello 3' -> 'Khoor').",
            type: "code",
            points: 20,
            topic: "strings",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNext()) {\n            String message = scanner.next();\n            int key = scanner.nextInt();\n            StringBuilder result = new StringBuilder();\n            key = key % 26;\n            for (int i = 0; i < message.length(); i++) {\n                char ch = message.charAt(i);\n                if (ch >= 'A' && ch <= 'Z') {\n                    result.append((char) ('A' + (ch - 'A' + key + 26) % 26));\n                } else if (ch >= 'a' && ch <= 'z') {\n                    result.append((char) ('a' + (ch - 'a' + key + 26) % 26));\n                } else {\n                    result.append(ch);\n                }\n            }\n            System.out.println(result.toString());\n        }\n    }\n}`,
            testCases: [
              { input: "Hello 3", output: "Khoor" },
              { input: "World 5", output: "Btqwi" },
              { input: "Java 2", output: "Lcxa" }
            ]
          }
        ]
      };

      await addDoc(collection(db, "exams"), examData);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      console.error("Seeding failed:", err);
      setError("Seeding failed. Verify your database connection.");
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: "100vh", padding: "20px" }}>
      <div className="glass-card" style={{ maxWidth: "460px", padding: "40px 32px", textAlign: "center" }}>
        <div className="flex-center" style={{ 
          width: "56px", 
          height: "56px", 
          borderRadius: "14px", 
          background: "var(--primary-light)", 
          border: "2px solid var(--border-color)",
          margin: "0 auto 20px auto" 
        }}>
          <BookOpen size={28} style={{ color: "var(--primary)" }} />
        </div>
        
        <h2>Genx Seeder Tool</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px", marginBottom: "28px", textAlign: "center" }}>
          Click the button below to seed the full **ICSE Class X Java Model Question Paper** directly into your dashboard.
        </p>

        {error && (
          <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px", border: "2px solid var(--danger)", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "12px", border: "2px solid var(--success)", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
            🎉 Exam Paper seeded successfully! Redirecting...
          </div>
        ) : (
          <button onClick={handleSeed} className="btn btn-primary" style={{ width: "100%", height: "46px", gap: "10px" }} disabled={seeding}>
            <Play size={16} />
            {seeding ? "Seeding Exam..." : "Generate Practice Exam Paper"}
          </button>
        )}
      </div>
    </div>
  );
}
