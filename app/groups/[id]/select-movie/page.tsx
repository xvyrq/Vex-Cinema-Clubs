"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
}

interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
}

interface WatchProviders {
  link?: string
  flatrate?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
}

export default function SelectMoviePage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [error, setError] = useState("")

  // Fetch watch providers when a movie is selected
  useEffect(() => {
    if (selectedMovie) {
      fetchWatchProviders(selectedMovie.id)
    } else {
      setWatchProviders(null)
    }
  }, [selectedMovie])

  const fetchWatchProviders = async (movieId: number) => {
    try {
      const response = await fetch(`/api/tmdb/watch-providers/${movieId}`)
      if (response.ok) {
        const data = await response.json()
        setWatchProviders(data.providers)
      }
    } catch (error) {
      console.error("Failed to fetch watch providers:", error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError("")

    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      setError("Failed to search movies. Please try again.")
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const loadWatchProviders = async (movieId: number) => {
    try {
      const response = await fetch(
        `/api/tmdb/watch-providers?movieId=${movieId}`
      )
      if (response.ok) {
        const data = await response.json()
        setWatchProviders(data)
      }
    } catch (error) {
      console.error("Failed to fetch watch providers:", error)
    }
  }

  const handleSelectMovie = async (movie: Movie) => {
    setSelectedMovie(movie)
    setWatchProviders(null)
    await loadWatchProviders(movie.id)
  }

  const handleLockMovie = async () => {
    if (!selectedMovie) return

    setIsLocking(true)
    setError("")

    try {
      const response = await fetch(`/api/groups/${groupId}/select-movie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdbId: selectedMovie.id,
          title: selectedMovie.title,
          overview: selectedMovie.overview,
          posterPath: selectedMovie.poster_path,
          backdropPath: selectedMovie.backdrop_path,
          releaseDate: selectedMovie.release_date,
          voteAverage: selectedMovie.vote_average,
          streamingProviders: watchProviders,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to select movie")
        return
      }

      router.push(`/groups/${groupId}`)
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Lock movie error:", error)
    } finally {
      setIsLocking(false)
    }
  }

  const getProviderLogoUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/w92${path}`
  }

  const getPosterUrl = (path: string | null) => {
    if (!path) return "/placeholder-poster.png"
    return `https://image.tmdb.org/t/p/w500${path}`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back to Group
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Select Your Movie</h1>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search for a Movie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded">
          {error}
        </div>
      )}

      {/* Selected Movie */}
      {selectedMovie && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle>Selected Movie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <img
                src={getPosterUrl(selectedMovie.poster_path)}
                alt={selectedMovie.title}
                className="w-32 h-48 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedMovie.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedMovie.release_date?.split("-")[0] || "N/A"}
                </p>
                <p className="text-sm mb-4 line-clamp-3">
                  {selectedMovie.overview}
                </p>

                {/* Watch Providers */}
                {watchProviders && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Where to Watch:</p>
                    <div className="space-y-2">
                      {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Stream:</p>
                          <div className="flex gap-2 flex-wrap">
                            {watchProviders.flatrate.map((provider) => (
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
                      {watchProviders.rent && watchProviders.rent.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rent:</p>
                          <div className="flex gap-2 flex-wrap">
                            {watchProviders.rent.map((provider) => (
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
                      {watchProviders.buy && watchProviders.buy.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Buy:</p>
                          <div className="flex gap-2 flex-wrap">
                            {watchProviders.buy.map((provider) => (
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

                <div className="flex gap-2">
                  <Button onClick={handleLockMovie} disabled={isLocking}>
                    {isLocking ? "Locking..." : "Lock In This Movie"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMovie(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !selectedMovie && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((movie) => (
            <Card
              key={movie.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectMovie(movie)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-20 h-30 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {movie.release_date?.split("-")[0] || "N/A"}
                    </p>
                    <p className="text-xs line-clamp-2">{movie.overview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !isSearching && (
        <div className="text-center py-12 text-muted-foreground">
          No movies found. Try a different search term.
        </div>
      )}
    </div>
  )
}
