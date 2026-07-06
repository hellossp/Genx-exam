"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Play } from "lucide-react";
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
        title: "ICSE Class X - Computer Applications (Java) Full Practice Test",
        description: "Full Syllabus Practice Model Question Paper with complete solutions. Covers OOP revision, Library Classes, Arrays, String Handling, User-Defined Methods, Constructors, and Patterns.",
        duration: 180, // 3 Hours
        showScoreImmediately: true,
        status: "active",
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        questions: [
          // ==================== SECTION A: MCQS (1-20) ====================
          {
            id: "q-a1",
            text: "Which of the following is NOT a fundamental feature of Object Oriented Programming?",
            type: "mcq",
            points: 1,
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
            points: 1,
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
            points: 1,
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
            points: 1,
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
            points: 1,
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
            points: 1,
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
            points: 1,
            topic: "conditionals",
            options: [
              "exit",
              "stop",
              "break",
              "return (compulsorily)"
            ],
            correctAnswer: "2"
          },
          {
            id: "q-a8",
            text: "Which loop is guaranteed to execute its body at least once, even if the test condition is initially false?",
            type: "mcq",
            points: 1,
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
            points: 1,
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
            points: 1,
            topic: "arrays",
            options: [
              "-1",
              "0",
              "1",
              "It depends on the declaration"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a11",
            text: "Which class from java.lang is typically used in ICSE Java programs for mutable (changeable) strings?",
            type: "mcq",
            points: 1,
            topic: "strings",
            options: [
              "String",
              "StringBuffer",
              "Array",
              "Character"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a12",
            text: "What does \"Cognitive\".charAt(1) return?",
            type: "mcq",
            points: 1,
            topic: "strings",
            options: [
              "C",
              "o",
              "g",
              "n"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a13",
            text: "Which String method converts all characters of a string to lower case?",
            type: "mcq",
            points: 1,
            topic: "strings",
            options: [
              "toLowerCase()",
              "lower()",
              "toLower()",
              "lowerCase()"
            ],
            correctAnswer: "0"
          },
          {
            id: "q-a14",
            text: "A method that shares the same name as another method in the same class, but differs in its parameter list, illustrates:",
            type: "mcq",
            points: 1,
            topic: "methods",
            options: [
              "Method overriding",
              "Method overloading",
              "Recursion",
              "Constructor chaining"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a15",
            text: "Every correctly written recursive method must contain:",
            type: "mcq",
            points: 1,
            topic: "recursion",
            options: [
              "A loop statement",
              "A base case that stops the recursion",
              "A void return type",
              "The static keyword"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a16",
            text: "Which statement about a constructor is TRUE?",
            type: "mcq",
            points: 1,
            topic: "constructors",
            options: [
              "It must have a return type of void",
              "It has the same name as the class",
              "It can be invoked explicitly like an ordinary method, e.g. obj.ClassName();",
              "It must always be declared private"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a17",
            text: "A default (no-argument) constructor is automatically supplied by the Java compiler when:",
            type: "mcq",
            points: 1,
            topic: "constructors",
            options: [
              "The class defines no constructor of its own",
              "The class has overloaded methods",
              "It is always supplied, regardless of other constructors",
              "Never — Java never supplies one"
            ],
            correctAnswer: "0"
          },
          {
            id: "q-a18",
            text: "What is returned by the expression Integer.parseInt(\"36\")?",
            type: "mcq",
            points: 1,
            topic: "library classes",
            options: [
              "The String \"36\"",
              "The int value 36",
              "An Integer object referencing 36",
              "A compile-time error"
            ],
            correctAnswer: "1"
          },
          {
            id: "q-a19",
            text: "Which of the following is NOT a valid method of the Math class?",
            type: "mcq",
            points: 1,
            topic: "library classes",
            options: [
              "Math.pow()",
              "Math.sqrt()",
              "Math.random()",
              "Math.divide()"
            ],
            correctAnswer: "3"
          },
          {
            id: "q-a20",
            text: "In a nested loop, if the outer loop runs 4 times and the inner loop runs 3 times on every pass, the innermost statement executes:",
            type: "mcq",
            points: 1,
            topic: "loops",
            options: [
              "4 times",
              "3 times",
              "7 times",
              "12 times"
            ],
            correctAnswer: "3"
          },

          // ==================== SECTION B: OUTPUTS (1-8) ====================
          {
            id: "q-b1",
            text: "Give the exact output produced by the following nested loop. Format with newlines:\n```java\nint x = 1;\nfor (int i = 1; i <= 3; i++) {\n  for (int j = 1; j <= i; j++) {\n    x = x + j;\n    System.out.print(x + \" \");\n  }\n  System.out.println();\n}\n```",
            type: "text",
            points: 5,
            topic: "loops",
            correctAnswer: "2\n3 5\n6 8 11"
          },
          {
            id: "q-b2",
            text: "Give the output produced by the following switch block:\n```java\nint m = 2;\nswitch (m) {\n  case 1: System.out.println(\"One\");\n  case 2: System.out.println(\"Two\");\n  case 3: System.out.println(\"Three\"); break;\n  case 4: System.out.println(\"Four\");\n  default: System.out.println(\"Default\");\n}\n```",
            type: "text",
            points: 5,
            topic: "conditionals",
            correctAnswer: "Two\nThree"
          },
          {
            id: "q-b3",
            text: "Give the output produced by the array loop:\n```java\nint arr[] = {5, 12, 8, 21, 3};\nint sum = 0, max = arr[0];\nfor (int i = 0; i < arr.length; i++) {\n  sum += arr[i];\n  if (arr[i] > max) max = arr[i];\n}\nSystem.out.println(\"Sum = \" + sum);\nSystem.out.println(\"Max = \" + max);\n```",
            type: "text",
            points: 5,
            topic: "arrays",
            correctAnswer: "Sum = 49\nMax = 21"
          },
          {
            id: "q-b4",
            text: "Give the output produced by the String methods:\n```java\nString s = \"Computer Applications\";\nSystem.out.println(s.length());\nSystem.out.println(s.substring(0, 8));\nSystem.out.println(s.indexOf(\"Appl\"));\nSystem.out.println(s.charAt(9));\n```",
            type: "text",
            points: 5,
            topic: "strings",
            correctAnswer: "21\nComputer\n9\nA"
          },
          {
            id: "q-b5",
            text: "Give the output when these calls are executed:\n`t.show(5);` \n`t.show(5.0);` \n`t.show(3, 4);` \n(Method show definitions:)\n`void show(int a) { System.out.println(\"int: \" + a); }`\n`void show(double a) { System.out.println(\"double: \" + a); }`\n`void show(int a, int b) { System.out.println(\"sum: \" + (a + b)); }`",
            type: "text",
            points: 5,
            topic: "methods",
            correctAnswer: "int: 5\ndouble: 5.0\nsum: 7"
          },
          {
            id: "q-b6",
            text: "Give the output of the Math functions:\n```java\nSystem.out.println(Math.pow(2, 3));\nSystem.out.println(Math.sqrt(49));\nSystem.out.println(Math.abs(-15));\nSystem.out.println(Math.max(23, Math.min(45, 10)));\n```",
            type: "text",
            points: 5,
            topic: "library classes",
            correctAnswer: "8.0\n7.0\n15\n23"
          },
          {
            id: "q-b7",
            text: "Give the output of the recursive factorial function `fact(5)`:\n`static int fact(int n) { if (n <= 1) return 1; return n * fact(n - 1); }`",
            type: "text",
            points: 5,
            topic: "recursion",
            correctAnswer: "120"
          },
          {
            id: "q-b8",
            text: "Give the volume outputs of constructors:\n`Box b1 = new Box(); Box b2 = new Box(2, 3, 4); b1.volume(); b2.volume();` \n(Note: default Box constructor prints \"Default constructor called\" and sets l=b=h=1. Parameterized constructor prints \"Parameterized constructor called\" and sets measurements. `volume()` prints \"Volume = \" + (l*b*h)).",
            type: "text",
            points: 5,
            topic: "constructors",
            correctAnswer: "Default constructor called\nParameterized constructor called\nVolume = 1\nVolume = 24"
          },

          // ==================== SECTION C: COMPILERS (1-7) ====================
          {
            id: "q-c1",
            text: "Q1. Magic Square Check. Write a Java program that reads matrix size n (n <= 10) followed by n x n integers from stdin. The program checks if the sum of every row, column, and diagonals are equal. Print the matrix separated by tabs, followed by 'MAGIC SQUARE' or 'NOT A MAGIC SQUARE'.",
            type: "code",
            points: 20,
            topic: "arrays",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\nclass MagicSquare {\n    int n;\n    int matrix[][];\n    MagicSquare(int n) {\n        this.n = n;\n        matrix = new int[n][n];\n    }\n    void fill(Scanner sc) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                matrix[i][j] = sc.nextInt();\n            }\n        }\n    }\n    boolean isMagic() {\n        int target = 0;\n        for (int j = 0; j < n; j++) target += matrix[0][j];\n        for (int i = 0; i < n; i++) {\n            int rowSum = 0;\n            for (int j = 0; j < n; j++) rowSum += matrix[i][j];\n            if (rowSum != target) return false;\n        }\n        for (int j = 0; j < n; j++) {\n            int colSum = 0;\n            for (int i = 0; i < n; i++) colSum += matrix[i][j];\n            if (colSum != target) return false;\n        }\n        int diag1 = 0, diag2 = 0;\n        for (int i = 0; i < n; i++) {\n            diag1 += matrix[i][i];\n            diag2 += matrix[i][n - 1 - i];\n        }\n        return (diag1 == target && diag2 == target);\n    }\n    void display() {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                System.out.print(matrix[i][j] + "\\t");\n            }\n            System.out.println();\n        }\n        if (isMagic()) System.out.println("MAGIC SQUARE");\n        else System.out.println("NOT A MAGIC SQUARE");\n    }\n}\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            MagicSquare ms = new MagicSquare(n);\n            ms.fill(sc);\n            ms.display();\n        }\n    }\n}`,
            testCases: [
              { input: "3\n2 7 6\n9 5 1\n4 3 8", output: "2\t7\t6\t\n9\t5\t1\t\n4\t3\t8\t\nMAGIC SQUARE" },
              { input: "3\n1 2 3\n4 5 6\n7 8 9", output: "1\t2\t3\t\n4\t5\t6\t\n7\t8\t9\t\nNOT A MAGIC SQUARE" }
            ]
          },
          {
            id: "q-c2",
            text: "Q2. Word Reversal. Write a Java program that accepts a sentence from stdin and prints a new sentence in which each word is individually reversed, but the order of the words remains unchanged. DO NOT use StringBuffer.reverse() method.",
            type: "code",
            points: 20,
            topic: "strings",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String sentence = sc.nextLine();\n            String result = "";\n            String word = "";\n            for (int i = 0; i <= sentence.length(); i++) {\n                if (i == sentence.length() || sentence.charAt(i) == ' ') {\n                    String reversedWord = "";\n                    for (int j = word.length() - 1; j >= 0; j--) {\n                        reversedWord = reversedWord + word.charAt(j);\n                    }\n                    result = result + reversedWord + " ";\n                    word = "";\n                } else {\n                    word = word + sentence.charAt(i);\n                }\n            }\n            System.out.println("Reversed word-wise: " + result.trim());\n        }\n    }\n}`,
            testCases: [
              { input: "This is a test", output: "Reversed word-wise: sihT si a tset" },
              { input: "Hello World", output: "Reversed word-wise: olleH dlroW" }
            ]
          },
          {
            id: "q-c3",
            text: "Q3. HCF using Overloading and Recursion. Write a Java program to compute the HCF of two numbers using both iterative and recursive methods. Read two integers from stdin. Output 'HCF (Iterative) = X', 'HCF (Recursive) = Y', and 'Both methods give the same result.' if they match.",
            type: "code",
            points: 20,
            topic: "methods",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\nclass HCFDemo {\n    int hcfIterative(int a, int b) {\n        int x = a, y = b;\n        while (y != 0) {\n            int temp = y;\n            y = x % y;\n            x = temp;\n        }\n        return x;\n    }\n    int hcfRecursive(int a, int b) {\n        if (b == 0) return a;\n        return hcfRecursive(b, a % b);\n    }\n}\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            HCFDemo obj = new HCFDemo();\n            int h1 = obj.hcfIterative(a, b);\n            int h2 = obj.hcfRecursive(a, b);\n            System.out.println("HCF (Iterative) = " + h1);\n            System.out.println("HCF (Recursive) = " + h2);\n            if (h1 == h2) {\n                System.out.println("Both methods give the same result.");\n            } else {\n                System.out.println("Results do not match.");\n            }\n        }\n    }\n}`,
            testCases: [
              { input: "48 18", output: "HCF (Iterative) = 6\nHCF (Recursive) = 6\nBoth methods give the same result." },
              { input: "15 5", output: "HCF (Iterative) = 5\nHCF (Recursive) = 5\nBoth methods give the same result." }
            ]
          },
          {
            id: "q-c4",
            text: "Q4. Duck Numbers. Write a Java program to read N from stdin and print all Duck Numbers between 1 and N (inclusive) separated by space, followed by the total count found. (A Duck Number has a zero in it but doesn't start with a zero).",
            type: "code",
            points: 20,
            topic: "library classes",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int count = 0;\n            System.out.println("Duck Numbers between 1 and " + n + ":");\n            for (int i = 1; i <= n; i++) {\n                String s = String.valueOf(i);\n                if (s.substring(1).indexOf('0') != -1) {\n                    System.out.print(i + " ");\n                    count++;\n                }\n            }\n            System.out.println();\n            System.out.println("Total Duck Numbers found: " + count);\n        }\n    }\n}`,
            testCases: [
              { input: "100", output: "Duck Numbers between 1 and 100:\n10 20 30 40 50 60 70 80 90 100 \nTotal Duck Numbers found: 10" }
            ]
          },
          {
            id: "q-c5",
            text: "Q5. Student Result Class. Write a Student class with name, rollNo, marks[], percentage, and grade. Create s1 (default) and s2 (parameterized with roll 101, name 'Aditi Sharma', marks 85, 90, 78, 88, 95). Calculate and display both separated by dashes.",
            type: "code",
            points: 20,
            topic: "constructors",
            language: "java",
            codeTemplate: `class Student {\n    int rollNo;\n    String name;\n    int marks[];\n    double percentage;\n    char grade;\n    Student() {\n        rollNo = 0;\n        name = "No Name";\n        marks = new int[5];\n    }\n    Student(int r, String n, int m[]) {\n        rollNo = r;\n        name = n;\n        marks = new int[5];\n        for (int i = 0; i < 5; i++) marks[i] = m[i];\n    }\n    void calculate() {\n        int total = 0;\n        for (int i = 0; i < 5; i++) total += marks[i];\n        percentage = (total / 500.0) * 100;\n        if (percentage >= 90) grade = 'A';\n        else if (percentage >= 75) grade = 'B';\n        else if (percentage >= 60) grade = 'C';\n        else if (percentage >= 40) grade = 'D';\n        else grade = 'E';\n    }\n    void display() {\n        System.out.println("Roll No : " + rollNo);\n        System.out.println("Name : " + name);\n        System.out.print("Marks : ");\n        for (int i = 0; i < 5; i++) System.out.print(marks[i] + " ");\n        System.out.println();\n        System.out.printf("Percentage: %.2f\\n", percentage);\n        System.out.println("Grade : " + grade);\n        System.out.println("--------------------------");\n    }\n}\n\npublic class Main {\n    public static void main(String args[]) {\n        Student s1 = new Student();\n        s1.calculate();\n        s1.display();\n        int m[] = {85, 90, 78, 88, 95};\n        Student s2 = new Student(101, "Aditi Sharma", m);\n        s2.calculate();\n        s2.display();\n    }\n}`,
            testCases: [
              { input: "", output: "Roll No : 0\nName : No Name\nMarks : 0 0 0 0 0 \nPercentage: 0.00\nGrade : E\n--------------------------\nRoll No : 101\nName : Aditi Sharma\nMarks : 85 90 78 88 95 \nPercentage: 87.20\nGrade : B\n--------------------------" }
            ]
          },
          {
            id: "q-c6",
            text: "Q6. Number Pyramid Pattern. Write a Java program to read n from stdin and display the number pyramid pattern up to n rows mirrored downward. (For n=4, it prints rows up to 10).",
            type: "code",
            points: 20,
            topic: "loops",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int num = 1;\n            int rowStart[] = new int[n];\n            for (int i = 1; i <= n; i++) {\n                rowStart[i - 1] = num;\n                for (int j = 1; j <= i; j++) {\n                    System.out.print(num + " ");\n                    num++;\n                }\n                System.out.println();\n            }\n            for (int i = n; i >= 1; i--) {\n                int start = rowStart[i - 1];\n                for (int j = 0; j < i; j++) {\n                    System.out.print((start + j) + " ");\n                }\n                System.out.println();\n            }\n        }\n    }\n}`,
            testCases: [
              { input: "4", output: "1 \n2 3 \n4 5 6 \n7 8 9 10 \n7 8 9 10 \n4 5 6 \n2 3 \n1 " }
            ]
          },
          {
            id: "q-c7",
            text: "Q7. Caesar Cipher. Design a class Cipher with String encrypt(String message, int key) and String decrypt(String message, int key). Read a string sentence and an integer key from stdin and print the encrypted and decrypted message.",
            type: "code",
            points: 20,
            topic: "strings",
            language: "java",
            codeTemplate: `import java.util.Scanner;\n\nclass Cipher {\n    String encrypt(String message, int key) {\n        String result = "";\n        key = key % 26;\n        for (int i = 0; i < message.length(); i++) {\n            char ch = message.charAt(i);\n            if (ch >= 'A' && ch <= 'Z') {\n                result += (char) ('A' + (ch - 'A' + key + 26) % 26);\n            } else if (ch >= 'a' && ch <= 'z') {\n                result += (char) ('a' + (ch - 'a' + key + 26) % 26);\n            } else {\n                result += ch;\n            }\n        }\n        return result;\n    }\n    String decrypt(String message, int key) {\n        return encrypt(message, -key);\n    }\n}\n\npublic class Main {\n    public static void main(String args[]) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String msg = sc.nextLine();\n            int key = sc.nextInt();\n            Cipher c = new Cipher();\n            String enc = c.encrypt(msg, key);\n            String dec = c.decrypt(enc, key);\n            System.out.println("Encrypted: " + enc);\n            System.out.println("Decrypted: " + dec);\n        }\n    }\n}`,
            testCases: [
              { input: "Hello World\n3", output: "Encrypted: Khoor Zruog\nDecrypted: Hello World" }
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
          Click the button below to seed the **complete 35-question ICSE Class X Java Exam Paper** (Section A, B, and C) directly into your dashboard.
        </p>

        {error && (
          <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px", border: "2px solid var(--danger)", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background: "var(--success-light)", color: "var(--success)", padding: "12px", border: "2px solid var(--success)", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
            🎉 Complete Exam Paper seeded successfully! Redirecting...
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
