import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Phone } from 'lucide-react';
import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  discoverMovies,
  discoverTVShows,
} from '@/lib/tmdb-client';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [popularTV, setPopularTV] = useState<TMDBTVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [animatedMovies, setAnimatedMovies] = useState<TMDBMovie[]>([]);
  const [localMovies, setLocalMovies] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [heroItem, setHeroItem] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          trendingRes,
          popularRes,
          tvRes,
          topRatedRes,
          animatedRes,
          saMoviesRes,
          saTvRes,
          zwMoviesRes,
          zwTvRes,
          ngMoviesRes,
          ngTvRes,
        ] = await Promise.all([
          getTrending('all', 'week'),
          getPopularMovies(),
          getPopularTVShows(),
          getTopRatedMovies(),
          discoverMovies({ with_genres: '16', sort_by: 'popularity.desc' }),
          discoverMovies({ with_origin_country: 'ZA', sort_by: 'popularity.desc' }),
          discoverTVShows({ with_origin_country: 'ZA', sort_by: 'popularity.desc' }),
          discoverMovies({ with_origin_country: 'ZW', sort_by: 'popularity.desc' }),
          discoverTVShows({ with_origin_country: 'ZW', sort_by: 'popularity.desc' }),
          discoverMovies({ with_origin_country: 'NG', sort_by: 'popularity.desc' }),
          discoverTVShows({ with_origin_country: 'NG', sort_by: 'popularity.desc' }),
        ]);

        setTrending(trendingRes.results.slice(0, 16));
        setPopularMovies(popularRes.results.slice(0, 16));
        setPopularTV(tvRes.results.slice(0, 16));
        setTopRatedMovies(topRatedRes.results.slice(0, 16));
        setAnimatedMovies(animatedRes.results.slice(0, 16));

        // Mix local content from ZA, ZW, NG
        const local = [
          ...saMoviesRes.results.slice(0, 6),
          ...saTvRes.results.slice(0, 4),
          ...zwMoviesRes.results.slice(0, 3),
          ...zwTvRes.results.slice(0, 2),
          ...ngMoviesRes.results.slice(0, 6),
          ...ngTvRes.results.slice(0, 4),
        ];
        // Shuffle local results
        for (let i = local.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [local[i], local[j]] = [local[j], local[i]];
        }
        setLocalMovies(local.slice(0, 16));

        // Set hero from first trending movie with a backdrop
        const hero = trendingRes.results.find(
          (item): item is TMDBMovie | TMDBTVShow =>
            'backdrop_path' in item && item.backdrop_path !== null
        );
        if (hero) setHeroItem(hero);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cycle hero banner through trending items every 10 seconds
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroItem((prev) => {
        const candidates = trending.filter((t) => t.backdrop_path);
        if (candidates.length <= 1) return prev;
        let next;
        do {
          next = candidates[Math.floor(Math.random() * candidates.length)];
        } while (next && prev && next.id === prev.id);
        return next || prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [trending]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-destructive text-base mb-2">{error}</p>
        <p className="text-sm text-muted-foreground text-center">
          Please make sure your TMDB API key is configured correctly.
        </p>
      </div>
    );
  }

  const heroType = heroItem && 'title' in heroItem ? 'movie' : 'tv';

  return (
    <div className="animate-fade-in">
      {/* Logo hero - full width with slow rotation */}
      <div
        className="w-full flex items-center justify-center py-8 px-4"
        style={{ minHeight: '220px' }}
      >
        <img
          src="/logo.png"
          alt="Byton Movies"
          className="w-full max-w-3xl object-contain"
          style={{ animation: 'spin-slow 20s linear infinite' }}
        />
      </div>

      {heroItem && <HeroBanner item={heroItem} type={heroType} />}

      <div className="relative z-10 -mt-8 md:-mt-16">
        <MovieRow title="Trending Now" items={trending} type="movie" />
        <MovieRow title="Popular Movies" items={popularMovies} type="movie" />
        <MovieRow title="Cartoons" items={animatedMovies} type="movie" />
        <MovieRow title="Popular Series" items={popularTV} type="tv" />
        <MovieRow title="Local Movies" items={localMovies} type="movie" />
        <MovieRow title="Top Rated Movies" items={topRatedMovies} type="movie" />
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-10 pb-8 border-t border-border">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          {/* Contact */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a
              href="mailto:help@zimdev.online"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4 text-primary" />
              help@zimdev.online
            </a>
            <a
              href="https://wa.me/263786443311"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-primary" />
              +263 786 443 311
            </a>
          </div>

          {/* Glowing caption */}
          <a
            href="https://wa.me/263786443311"
            target="_blank"
            rel="noopener noreferrer"
            className="glow-caption text-sm font-medium text-primary mt-2"
          >
            This website was created by ZimDev
          </a>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground mt-2">
            2026&reg; | ZimDev Production
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
