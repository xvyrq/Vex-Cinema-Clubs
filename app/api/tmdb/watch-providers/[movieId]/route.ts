import { NextRequest, NextResponse } from "next/server"
import { tmdb } from "@/lib/tmdb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const { movieId } = await params
    const movieIdNum = parseInt(movieId, 10)

    if (isNaN(movieIdNum)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      )
    }

    const watchProviders = await tmdb.getWatchProviders(movieIdNum)

    return NextResponse.json({ providers: watchProviders }, { status: 200 })
  } catch (error) {
    console.error("Watch providers fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch watch providers" },
      { status: 500 }
    )
  }
}
