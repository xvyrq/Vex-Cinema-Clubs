import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tmdb } from "@/lib/tmdb"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await params

    const { tmdbId, title, overview, posterPath, backdropPath, releaseDate, voteAverage } =
      await request.json()

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      )
    }

    // Get group settings to verify it's this user's turn
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        settings: true,
        members: {
          orderBy: { rotationOrder: "asc" },
          where: { isSkipped: false },
        },
      },
    })

    if (!group || !group.settings) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const currentPicker = group.members[group.settings.currentPickerIndex]

    if (currentPicker?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "It's not your turn to select a movie" },
        { status: 403 }
      )
    }

    // Check if there's already a locked or published movie for current period
    const existingMovie = await prisma.movie.findFirst({
      where: {
        groupId,
        status: {
          in: ["LOCKED", "PUBLISHED", "RATING_PERIOD"],
        },
      },
    })

    if (existingMovie) {
      return NextResponse.json(
        { error: "A movie has already been selected for this period" },
        { status: 400 }
      )
    }

    // Fetch watch providers from TMDB
    const watchProviders = await tmdb.getWatchProviders(tmdbId, "US")

    // Create the movie selection
    const movie = await prisma.movie.create({
      data: {
        groupId,
        tmdbId,
        title,
        overview,
        posterPath,
        backdropPath,
        releaseDate,
        voteAverage,
        watchProviders: watchProviders || undefined,
        selectedByUserId: session.user.id,
        selectedByName: session.user.name || "Unknown",
        lockedAt: new Date(),
        status: "LOCKED",
      },
    })

    return NextResponse.json({ movieId: movie.id }, { status: 201 })
  } catch (error) {
    console.error("Movie selection error:", error)
    return NextResponse.json(
      { error: "An error occurred while selecting the movie" },
      { status: 500 }
    )
  }
}
