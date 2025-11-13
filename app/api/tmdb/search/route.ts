import { NextRequest, NextResponse } from "next/server"
import { tmdb } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    const results = await tmdb.searchMovies(query)

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error("TMDB search error:", error)
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    )
  }
}
