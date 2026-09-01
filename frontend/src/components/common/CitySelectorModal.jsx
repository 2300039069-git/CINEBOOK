import React, { useState } from 'react';
import { Search, X, MapPin, Check, Sparkles } from 'lucide-react';
import { CITIES } from '../../data/mockData';
import { useLocation } from '../../context/LocationContext';

const CITY_DESCRIPTIONS = {
  guntur: 'Chilli City • Siva, Studio 81, Naz, Bhaskar (7 Theatres)',
  vijayawada: 'Capital City • G3 Raj Yuvraj, Alankar, Sailaja (8 Theatres)',
  tenali: 'Paris of Andhra • Asha, Sangameswara, SV Priya, V-Max (7 Theatres)'
};

const CitySelectorModal = () => {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, setSelectedCity } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isCityModalOpen) return null;

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCityModalOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl overflow-hidden border border-[var(--theme-border)]">
        {/* Header with Search */}
        <div className="p-6 border-b border-[var(--theme-border)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-theme-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-500" />
              <span>Select Location (Andhra Pradesh)</span>
            </h2>
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="p-1.5 rounded-full text-theme-muted hover:text-theme-primary glass-card transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-theme-muted">
            Choose your city to browse live cinema showtimes across Guntur, Vijayawada & Tenali
          </p>

          {/* Search Input */}
          <div className="relative pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Search Guntur, Vijayawada, Tenali..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-2xl text-xs sm:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        {/* Modal Body: The 3 Locations Grid */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredCities.map((city) => {
            const isSelected = selectedCity.id === city.id;
            return (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 shadow-md scale-102'
                    : 'glass-card hover:border-pink-500/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl p-2 rounded-2xl bg-black/10 dark:bg-white/5 group-hover:scale-110 transition-transform">
                    {city.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-theme-primary">
                        {city.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase">
                        {city.state}
                      </span>
                    </div>
                    <p className="text-xs text-theme-muted mt-0.5">
                      {CITY_DESCRIPTIONS[city.id] || 'Verified Multiplexes and 4K Cinemas'}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-glow-pink">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CitySelectorModal;
