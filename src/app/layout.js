import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "ApexExam | Host, Track and Analyze Exams",
  description: "A premium analytical exam hosting environment with real-time student tracking, anti-cheat detection, and comprehensive feedback systems.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
