import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { auth } from "@/auth";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Sponsors from "@/components/Sponsors";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
});

export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="lt" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        <AuthSessionProvider session={session}>
          <Header />
          <main>{children}</main>
          <Sponsors />
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
