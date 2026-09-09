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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden text-text-primary">
        {/* Header with Search */}
        <div className="p-6 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Select Location (Andhra Pradesh)</span>
            </h2>
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="p-1.5 rounded-full text-text-muted hover:text-text-primary bg-surface-elevated hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-text-muted">
            Choose your city to browse live cinema showtimes across Guntur, Vijayawada & Tenali
          </p>

          {/* Search Input */}
          <div className="relative pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search Guntur, Vijayawada, Tenali..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-2xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all font-medium"
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
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-md scale-102'
                    : 'bg-surface hover:bg-surface-hover border-border hover:border-text-muted'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl p-2 rounded-2xl bg-surface-elevated group-hover:scale-110 transition-transform">
                    {city.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-text-primary">
                        {city.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase border border-primary/20">
                        {city.state}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {CITY_DESCRIPTIONS[city.id] || 'Verified Multiplexes and 4K Cinemas'}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-cta">
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
