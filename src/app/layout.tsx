import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterView AI — AI-Powered Technical Interview Simulations",
  description:
    "Master your technical interviews with AI-powered mock interviews, adaptive follow-up questions, and comprehensive performance reports. Practice with different AI personalities and get personalized feedback.",
  keywords: [
    "AI interview",
    "mock interview",
    "technical interview",
    "coding interview",
    "interview practice",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#111128",
          colorInput: "#0a0a1a",
        },
        elements: {
          card: "bg-[#111128]/95 border border-violet-400/20 shadow-2xl",
          headerTitle: "text-slate-100",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "bg-[#0a0a1a] border-violet-400/20 text-slate-100 hover:bg-violet-500/10",
          formFieldLabel: "text-slate-300",
          formFieldInput: "bg-[#0a0a1a] border-violet-400/20 text-slate-100",
          footerActionText: "text-slate-400",
          footerActionLink: "text-violet-300 hover:text-violet-200",
          identityPreviewEditButton: "text-violet-300",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col bg-bg-primary text-text-primary antialiased">
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
