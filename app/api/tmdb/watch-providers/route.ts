import { NextRequest, NextResponse } from "next/server"
import { tmdb } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const movieId = searchParams.get("movieId")
    const region = searchParams.get("region") || "US"

    if (!movieId) {
      return NextResponse.json(
        { error: "movieId parameter is required" },
        { status: 400 }
      )
    }

    const watchProviders = await tmdb.getWatchProviders(parseInt(movieId), region)

    return NextResponse.json(watchProviders, { status: 200 })
  } catch (error) {
    console.error("TMDB watch providers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch watch providers" },
      { status: 500 }
    )
  }
}
