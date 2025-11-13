"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Movie Club</h1>
          </Link>

          <nav className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
