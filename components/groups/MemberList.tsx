"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  userId: string
  rotationOrder: number
  role: string
  isSkipped: boolean
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface MemberListProps {
  members: Member[]
  groupId: string
  isCommissioner: boolean
  currentUserId: string
}

export function MemberList({ members, groupId, isCommissioner, currentUserId }: MemberListProps) {
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const handleSkipTurn = async (memberId: string, skip: boolean) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}/skip`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skip }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to skip turn:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 rounded hover:bg-muted"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  <p className="text-sm font-medium">
                    {member.user.name}
                    {member.userId === currentUserId && " (You)"}
                  </p>
                </div>
                {member.role === "COMMISSIONER" && (
                  <span className="text-xs text-muted-foreground">Commissioner</span>
                )}
                {member.isSkipped && (
                  <span className="text-xs text-muted-foreground">(Skipped)</span>
                )}
              </div>
              {isCommissioner && member.userId !== currentUserId && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSkipTurn(member.id, !member.isSkipped)}
                  >
                    {member.isSkipped ? "Unskip" : "Skip"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
