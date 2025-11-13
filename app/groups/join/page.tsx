"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JoinGroupPage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!joinCode.trim()) {
      setError("Join code is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joinCode: joinCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to join group")
        return
      }

      router.push(`/groups/${data.groupId}`)
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Join a Movie Club</CardTitle>
          <CardDescription>
            Enter the join code provided by the group commissioner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                type="text"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                The join code is a unique identifier for the group
              </p>
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Group"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
