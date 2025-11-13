import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      group: {
        include: {
          settings: true,
          members: {
            include: {
              user: true,
            },
          },
          movies: {
            where: {
              status: {
                in: ["PUBLISHED", "RATING_PERIOD", "COMPLETED"],
              },
            },
            orderBy: {
              publishedAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Movie Clubs</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}!
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/groups/create">
            <Button>Create Group</Button>
          </Link>
          <Link href="/groups/join">
            <Button variant="outline">Join Group</Button>
          </Link>
        </div>
      </div>

      {userGroups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create a new group or join an existing one to get started
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/groups/create">
                  <Button>Create Group</Button>
                </Link>
                <Link href="/groups/join">
                  <Button variant="outline">Join Group</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userGroups.map((membership) => {
            const group = membership.group
            const currentMovie = group.movies[0]
            const memberCount = group.members.length

            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>
                          {memberCount} {memberCount === 1 ? "member" : "members"}
                        </CardDescription>
                      </div>
                      {membership.role === "COMMISSIONER" && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Commissioner
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentMovie ? (
                      <div>
                        <p className="text-sm font-medium mb-1">Current Movie:</p>
                        <p className="text-sm text-muted-foreground">
                          {currentMovie.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected by {currentMovie.selectedByName}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No movie selected yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
