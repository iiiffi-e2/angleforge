import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AngleForge",
  description: "Generate strategic content angles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
             <Navbar />
             <main className="flex-1">
              {children}
             </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
