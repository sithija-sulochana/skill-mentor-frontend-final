import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Toaster } from "./ui/toaster";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
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
