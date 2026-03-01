import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Toaster } from "./ui/toaster";
import { useStudentSync } from "@/hooks/useStudentSync";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  // Automatically sync user with backend when logged in
  useStudentSync();

  return (
    <>
      <section className="min-h-screen flex flex-col">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </section>
      <Toaster />
    </>
  );
}
