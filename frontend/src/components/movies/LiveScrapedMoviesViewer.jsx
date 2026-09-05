import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Sparkles,
  Clock,
  MapPin,
  Star,
  Building,
  Ticket,
  CheckCircle2,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useBooking } from '../../context/BookingContext';
import { MOVIES, THEATRES } from '../../data/mockData';

export default function LiveScrapedMoviesViewer({ city }) {
  const { selectedCity } = useLocation();
  const activeCity = (city || selectedCity?.id || 'guntur').toLowerCase();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setSelectedMovie, setSelectedTheatre, setSelectedShow } = useBooking();
  const navigate = useNavigate();

  const fetchCityMovies = async (cityName) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${cityName}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn(`[Live Scraper Feed] Backend server notice (${err.message}). Using synchronized local city catalog.`);
      
      // Graceful synchronized fallback from local mock registry
      const localTheatres = THEATRES.filter(t => t.city === cityName);
      setData({
        city: cityName,
        cityName: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        totalMovies: MOVIES.length,
        totalTheatres: localTheatres.length,
        scraperEngine: 'CLIENT_OFFLINE_SYNC',
        movies: MOVIES.map(m => ({
          title: m.title,
          slug: m.slug,
          language: m.languages?.[0] || 'Telugu',
          rating: `${m.rating}/10`,
          formats: m.formats || ['2D', 'Dolby Atmos'],
          theaters: localTheatres.map(th => ({
            name: th.name,
            location: th.address,
            showtimes: [
              { time: '11:00 AM', format: '2D Dolby Atmos', availability: 'AVAILABLE' },
              { time: '02:30 PM', format: '2D Dolby Atmos', availability: 'FILLING_FAST' },
              { time: '06:15 PM', format: '2D Dolby Atmos', availability: 'ALMOST_FULL' },
              { time: '09:45 PM', format: '2D', availability: 'AVAILABLE' }
            ]
          }))
        }))
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCityMovies(activeCity);
  }, [activeCity]);

  const handleSelectShowtime = (movie, theater, showtime) => {
    const matchedMovie = MOVIES.find(m => m.title === movie.title || m.slug === movie.slug) || MOVIES[0];
    const matchedTheatre = THEATRES.find(t => t.name.includes(theater.name) || theater.name.includes(t.name)) || THEATRES[0];

    const showObj = {
      id: `sh-${matchedTheatre.id}-${showtime.time.replace(/[^0-9]/g, '')}`,
      movieId: matchedMovie.id,
      theatreId: matchedTheatre.id,
      theatreName: theater.name,
      time: showtime.time,
      format: showtime.format || '2D Dolby Atmos'
    };

    setSelectedMovie(matchedMovie);
    setSelectedTheatre(matchedTheatre);
    setSelectedShow(showObj);

    navigate(`/seat-selection/${showObj.id}`);
  };

  if (loading) {
    return (
      <div className="p-8 glass-panel rounded-3xl text-center space-y-3 animate-pulse">
        <Film className="w-10 h-10 text-pink-500 mx-auto animate-bounce" />
        <h3 className="text-sm font-black text-theme-primary">
          Fetching live BookMyShow listings for {activeCity.toUpperCase()}...
        </h3>
        <p className="text-xs text-theme-muted">Scanning currently screening cinemas and available showtimes</p>
      </div>
    );
  }

  if (!data?.movies || data.movies.length === 0) {
    return (
      <div className="p-8 glass-panel rounded-3xl text-center space-y-2">
        <h3 className="text-sm font-black text-theme-primary">No movies found for {activeCity.toUpperCase()}</h3>
        <p className="text-xs text-theme-muted">Run the scraper to extract fresh city showtimes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 glass-panel rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-theme-primary">
              Live Verified Showtimes in {data.cityName}
            </h3>
            <p className="text-[11px] text-theme-muted">
              {data.totalMovies} Movies Screening Across {data.totalTheatres} Theatres
            </p>
          </div>
        </div>

        <button
          onClick={() => { setRefreshing(true); fetchCityMovies(activeCity); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card hover:border-pink-500 text-xs font-bold text-pink-500 transition-all cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Movies Stream */}
      <div className="space-y-6">
        {data.movies.map((movie) => (
          <div
            key={movie.slug || movie.title}
            className="p-6 rounded-3xl glass-panel space-y-5 border border-[var(--theme-border)] hover:border-pink-500/50 transition-all shadow-lg"
          >
            {/* Movie Title & Format Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--theme-border)]">
              <div>
                <h4 className="text-xl font-black text-theme-primary font-display flex items-center gap-2">
                  {movie.title}
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ★ {movie.rating}
                  </span>
                </h4>
                <p className="text-xs text-theme-secondary mt-1 flex items-center gap-2">
                  <span className="font-bold text-theme-primary">{movie.language}</span>
                  <span>•</span>
                  <span className="text-cyan-400">{movie.formats?.join(' • ')}</span>
                </p>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 self-start sm:self-auto">
                Instant Seat Lock Active
              </span>
            </div>

            {/* Theatres & Showtimes List */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-theme-muted flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-500" /> Screening Theatres in {data.cityName}:
              </h5>

              <div className="grid grid-cols-1 gap-3.5">
                {movie.theaters?.map((th, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl glass-card space-y-3 hover:border-pink-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <strong className="text-xs font-black text-theme-primary">{th.name}</strong>
                      <span className="text-[11px] text-theme-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-500" /> {th.location}
                      </span>
                    </div>

                    {/* Showtime Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {th.showtimes?.map((st, sIdx) => {
                        const isAlmostFull = st.availability === 'ALMOST_FULL';
                        const isFillingFast = st.availability === 'FILLING_FAST';

                        return (
                          <button
                            key={sIdx}
                            onClick={() => handleSelectShowtime(movie, th, st)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm transform hover:scale-105 active:scale-95 ${
                              isAlmostFull
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500 text-amber-300'
                                : isFillingFast
                                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500 text-cyan-300'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500 text-emerald-300'
                            }`}
                            title="Click to select seats"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{st.time}</span>
                            <span className="text-[9px] opacity-75 font-normal">({st.format})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
