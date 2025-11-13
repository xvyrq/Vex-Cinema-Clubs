import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RatingForm } from "@/components/movies/RatingForm"
import { RatingsList } from "@/components/movies/RatingsList"

export default async function MovieDetailsPage({
  params,
}: {
  params: { id: string; movieId: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const movie = await prisma.movie.findUnique({
    where: { id: params.movieId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      ratings: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!movie) {
    return <div className="container mx-auto p-6">Movie not found</div>
  }

  // Check if user is a member
  const membership = movie.group.members.find((m) => m.userId === session.user.id)

  if (!membership) {
    redirect("/dashboard")
  }

  const userRating = movie.ratings.find((r) => r.userId === session.user.id)
  const canRate = movie.status === "PUBLISHED" || movie.status === "RATING_PERIOD"
  const ratingsRevealed = movie.status === "COMPLETED"

  // Calculate average rating if revealed
  const averageRating =
    ratingsRevealed && movie.ratings.length > 0
      ? movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length
      : null

  const getPosterUrl = (path: string | null) => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/w500${path}`
  }

  const getBackdropUrl = (path: string | null) => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/original${path}`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/groups/${params.id}`}>← Back to Group</Link>
        </Button>
      </div>

      {/* Backdrop */}
      {movie.backdropPath && (
        <div
          className="w-full h-64 bg-cover bg-center rounded-lg mb-6"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${getBackdropUrl(movie.backdropPath)})`,
          }}
        >
          <div className="h-full flex items-end p-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
              <p className="text-white/90">
                Selected by {movie.selectedByName}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {movie.posterPath && (
                  <img
                    src={getPosterUrl(movie.posterPath)!}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  {movie.releaseDate && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Release Date: {movie.releaseDate}
                    </p>
                  )}
                  {movie.voteAverage && (
                    <p className="text-sm text-muted-foreground mb-2">
                      TMDB Rating: {movie.voteAverage.toFixed(1)}/10
                    </p>
                  )}
                  {averageRating !== null && (
                    <p className="text-sm font-medium mb-2">
                      Group Average: {averageRating.toFixed(1)}/5.0 ⭐
                    </p>
                  )}
                </div>
              </div>
              {movie.overview && (
                <div>
                  <h3 className="font-semibold mb-2">Overview</h3>
                  <p className="text-sm text-muted-foreground">{movie.overview}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ratings Section */}
          {ratingsRevealed ? (
            <RatingsList ratings={movie.ratings} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">
                  {movie.ratings.length} rating(s) submitted
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ratings will be revealed at the end of the rating period
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating Form */}
          {canRate && (
            <RatingForm
              movieId={movie.id}
              groupId={params.id}
              existingRating={userRating}
            />
          )}

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-muted-foreground">
                    {movie.status === "LOCKED" && "Locked (Not Published)"}
                    {movie.status === "PUBLISHED" && "Published - Rating Period"}
                    {movie.status === "RATING_PERIOD" && "Rating Period Active"}
                    {movie.status === "COMPLETED" && "Completed - Ratings Revealed"}
                  </p>
                </div>
                {movie.publishedAt && (
                  <div>
                    <p className="font-medium">Published On</p>
                    <p className="text-muted-foreground">
                      {new Date(movie.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {movie.ratingRevealAt && (
                  <div>
                    <p className="font-medium">Ratings Reveal</p>
                    <p className="text-muted-foreground">
                      {new Date(movie.ratingRevealAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
