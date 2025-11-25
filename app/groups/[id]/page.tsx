import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GroupSettings } from "@/components/groups/GroupSettings"
import { MemberList } from "@/components/groups/MemberList"
import { CopyButton } from "@/components/groups/CopyButton"

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      settings: true,
      members: {
        include: {
          user: true,
        },
        orderBy: {
          rotationOrder: "asc",
        },
      },
      movies: {
        orderBy: {
          publishedAt: "desc",
        },
        take: 1,
        where: {
          status: {
            in: ["LOCKED", "PUBLISHED", "RATING_PERIOD", "COMPLETED"],
          },
        },
      },
    },
  })

  if (!group) {
    return <div className="container mx-auto p-6">Group not found</div>
  }

  const membership = group.members.find((m) => m.userId === session.user.id)

  if (!membership) {
    redirect("/dashboard")
  }

  const isCommissioner = membership.role === "COMMISSIONER"
  const currentMovie = group.movies[0]
  const settings = group.settings!
  const currentPicker = group.members[settings.currentPickerIndex]

  // Check if current user can select a movie
  const canSelectMovie = currentPicker?.userId === session.user.id

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                {group.members.length} members
                {isCommissioner && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    You are the Commissioner
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Join Code</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {group.joinCode}
                  </code>
                  <CopyButton text={group.joinCode} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this code with friends to invite them to the group
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Current Picker</p>
                <p className="text-sm text-muted-foreground">
                  {currentPicker?.user.name || "Unknown"}
                  {canSelectMovie && " (You!)"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Schedule</p>
                <p className="text-sm text-muted-foreground">
                  Announcement Day: {settings.announcementDay}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {settings.movieDuration === "WEEKLY" ? "1 week" : settings.movieDuration === "BIWEEKLY" ? "2 weeks" : "1 month"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Movie */}
          {currentMovie ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Movie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {currentMovie.posterPath && (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${currentMovie.posterPath}`}
                      alt={currentMovie.title}
                      className="w-32 h-48 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">{currentMovie.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Selected by {currentMovie.selectedByName}
                    </p>
                    {currentMovie.overview && (
                      <p className="text-sm mt-2">{currentMovie.overview}</p>
                    )}

                    {/* Watch Providers */}
                    {currentMovie.watchProviders && typeof currentMovie.watchProviders === 'object' && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Where to Watch:</p>
                        <div className="space-y-2">
                          {(currentMovie.watchProviders as any).flatrate && (currentMovie.watchProviders as any).flatrate.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Stream:</p>
                              <div className="flex gap-2 flex-wrap">
                                {(currentMovie.watchProviders as any).flatrate.map((provider: any) => (
                                  <img
                                    key={provider.provider_id}
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    title={provider.provider_name}
                                    className="w-10 h-10 rounded"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {(currentMovie.watchProviders as any).rent && (currentMovie.watchProviders as any).rent.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Rent:</p>
                              <div className="flex gap-2 flex-wrap">
                                {(currentMovie.watchProviders as any).rent.map((provider: any) => (
                                  <img
                                    key={provider.provider_id}
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    title={provider.provider_name}
                                    className="w-10 h-10 rounded"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {(currentMovie.watchProviders as any).buy && (currentMovie.watchProviders as any).buy.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Buy:</p>
                              <div className="flex gap-2 flex-wrap">
                                {(currentMovie.watchProviders as any).buy.map((provider: any) => (
                                  <img
                                    key={provider.provider_id}
                                    src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    title={provider.provider_name}
                                    className="w-10 h-10 rounded"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Link href={`/groups/${group.id}/movies/${currentMovie.id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No movie selected yet</p>
                  {canSelectMovie && (
                    <Link href={`/groups/${group.id}/select-movie`}>
                      <Button>Select Movie</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <MemberList
            members={group.members}
            groupId={group.id}
            isCommissioner={isCommissioner}
            currentUserId={session.user.id}
          />

          {/* Settings (Commissioner Only) */}
          {isCommissioner && (
            <GroupSettings
              groupId={group.id}
              settings={settings}
              members={group.members}
            />
          )}
        </div>
      </div>
    </div>
  )
}
