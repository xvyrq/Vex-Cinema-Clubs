import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; movieId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId, movieId } = await params

    const { rating, review } = await request.json()

    // Validate rating
    if (typeof rating !== "number" || rating < 0.5 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 0.5 and 5.0" },
        { status: 400 }
      )
    }

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

    // Check if movie exists and is in rating period
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    })

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    if (movie.status !== "PUBLISHED" && movie.status !== "RATING_PERIOD") {
      return NextResponse.json(
        { error: "Movie is not in rating period" },
        { status: 400 }
      )
    }

    // Create or update rating
    const userRating = await prisma.rating.upsert({
      where: {
        movieId_userId: {
          movieId,
          userId: session.user.id,
        },
      },
      update: {
        rating,
        review,
      },
      create: {
        movieId,
        userId: session.user.id,
        rating,
        review,
      },
    })

    return NextResponse.json({ rating: userRating }, { status: 200 })
  } catch (error) {
    console.error("Rating submission error:", error)
    return NextResponse.json(
      { error: "An error occurred while submitting rating" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; movieId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const ratingId = searchParams.get("ratingId")

    if (!ratingId) {
      return NextResponse.json(
        { error: "Rating ID is required" },
        { status: 400 }
      )
    }

    // Check if rating belongs to user
    const rating = await prisma.rating.findUnique({
      where: { id: ratingId },
    })

    if (!rating || rating.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Rating not found or unauthorized" },
        { status: 404 }
      )
    }

    await prisma.rating.delete({
      where: { id: ratingId },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Rating deletion error:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting rating" },
      { status: 500 }
    )
  }
}
