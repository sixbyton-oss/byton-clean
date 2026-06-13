import { TMDB_API_KEY } from '@/lib/tmdb'
import { supabase } from '@/db/supabase';
import type {
  TMDBResponse,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetail,
  TMDBTVShowDetail,
  TMDBSeasonDetail,
  TMDBWatchProvidersResponse,
  TMDBGenre,
  ContentType,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DIRECT_API_KEY = TMDB_API_KEY || '';

async function tmdbRequest<T>(path: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params || {});
  const queryString = searchParams.toString();
  const fullPath = queryString ? `${path}?${queryString}` : path;

  // Try Supabase Edge Function first (for deployed app)
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-proxy', {
      body: { path: fullPath },
    });

    if (!error && data) {
      return data as T;
    }
  } catch {
    // Edge Function unavailable, fall through to direct API
  }

  // Fallback: direct TMDB API call (for Vercel/standalone deployments)
  const separator = fullPath.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${fullPath}${separator}api_key=${DIRECT_API_KEY}`;

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return tmdbRequest(`/trending/${type}/${timeWindow}`);
}

export async function getPopularMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest('/movie/popular', { page });
}

export async function getTopRatedMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest('/movie/top_rated', { page });
}

export async function getNowPlayingMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest('/movie/now_playing', { page });
}

export async function getUpcomingMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest('/movie/upcoming', { page });
}

export async function getPopularTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbRequest('/tv/popular', { page });
}

export async function getTopRatedTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbRequest('/tv/top_rated', { page });
}

export async function getOnAirTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbRequest('/tv/on_the_air', { page });
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetail> {
  return tmdbRequest(`/movie/${id}`, {
    append_to_response: 'videos,credits',
  });
}

export async function getTVShowDetails(id: number): Promise<TMDBTVShowDetail> {
  return tmdbRequest(`/tv/${id}`, {
    append_to_response: 'videos,credits',
  });
}

export async function searchMulti(query: string, page = '1'): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return tmdbRequest('/search/multi', { query, page, include_adult: 'false' });
}

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbRequest('/genre/movie/list');
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return tmdbRequest('/genre/tv/list');
}

export async function discoverMovies(params: Record<string, string> = {}): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest('/discover/movie', params);
}

export async function discoverTVShows(params: Record<string, string> = {}): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbRequest('/discover/tv', params);
}

export async function getMovieRecommendations(id: number, page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbRequest(`/movie/${id}/recommendations`, { page });
}

export async function getTVRecommendations(id: number, page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return tmdbRequest(`/tv/${id}/recommendations`, { page });
}

export async function getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetail> {
  return tmdbRequest(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getMovieWatchProviders(id: number): Promise<TMDBWatchProvidersResponse> {
  return tmdbRequest(`/movie/${id}/watch/providers`);
}

export async function getTVWatchProviders(id: number): Promise<TMDBWatchProvidersResponse> {
  return tmdbRequest(`/tv/${id}/watch/providers`);
}

export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/original${path}`;
}

export function getTrailerKey(videos?: { results: { key: string; site: string; type: string }[] }): string | null {
  if (!videos?.results?.length) return null;
  const trailer = videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  if (trailer) return trailer.key;
  const anyVideo = videos.results.find((v) => v.site === 'YouTube');
  return anyVideo?.key || null;
}

export function formatYear(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatVote(vote: number): string {
  return vote ? vote.toFixed(1) : 'N/A';
}
