const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3'

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number
  genres: { id: number; name: string }[]
  production_companies: { id: number; name: string; logo_path: string | null }[]
  production_countries: { iso_3166_1: string; name: string }[]
  spoken_languages: { iso_639_1: string; name: string }[]
  status: string
  tagline: string
  budget: number
  revenue: number
}

export interface TMDBWatchProvider {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

export interface TMDBWatchProviders {
  link?: string
  flatrate?: TMDBWatchProvider[]
  rent?: TMDBWatchProvider[]
  buy?: TMDBWatchProvider[]
}

class TMDBClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not set')
    }
    this.apiKey = TMDB_API_KEY
    this.baseUrl = TMDB_API_BASE_URL
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`)
    }

    return response.json()
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
    return this.fetch<TMDBSearchResponse>('/search/movie', {
      query,
      page: page.toString(),
      include_adult: 'false',
    })
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    return this.fetch<TMDBMovieDetails>(`/movie/${movieId}`)
  }

  async getWatchProviders(movieId: number, region: string = 'US'): Promise<TMDBWatchProviders | null> {
    try {
      const response = await this.fetch<{ results: Record<string, TMDBWatchProviders> }>(
        `/movie/${movieId}/watch/providers`
      )
      return response.results[region] || null
    } catch (error) {
      console.error('Error fetching watch providers:', error)
      return null
    }
  }

  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500'): string | null {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  getPosterUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'w500')
  }

  getBackdropUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'original')
  }
}

export const tmdb = new TMDBClient()
