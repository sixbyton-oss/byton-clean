import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, Compass, Sparkles } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getImageUrl } from '@/lib/tmdb-client';

const Dashboard: React.FC = () => {
  const { favorites } = useFavorites();

  const stats = [
    { label: 'Watchlist', value: favorites.length, icon: Heart },
    { label: 'Reviews', value: 0, icon: Star },
    { label: 'Hours Watched', value: 0, icon: Clock },
    { label: 'Genres Explored', value: 0, icon: Compass },
  ];

  return (
    <div className="px-4 md:px-8 py-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center">
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Favorites */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Favorites
          </h2>
          <Link to="/favorites" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No favorites yet. Browse movies and series and hit the heart to save them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {favorites.slice(0, 10).map((fav) => (
              <Link
                key={`${fav.type}-${fav.id}`}
                to={`/${fav.type}/${fav.id}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                  <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {fav.type === 'movie' ? 'Film' : 'Series'}
                  </div>
                  {fav.posterPath && (
                    <img
                      src={getImageUrl(fav.posterPath, 'w342')}
                      alt={fav.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{fav.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
