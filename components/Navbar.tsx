"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut, signIn } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary">AngleForge</Link>
          {session && (
            <>
              <Link href="/generate" className="text-sm font-medium hover:text-primary transition-colors">Generate</Link>
              <Link href="/library" className="text-sm font-medium hover:text-primary transition-colors">Library</Link>
              <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors">Account</Link>
            </>
          )}
        </div>
        <div>
          {session ? (
            <Button variant="ghost" onClick={() => signOut()}>Sign Out</Button>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
