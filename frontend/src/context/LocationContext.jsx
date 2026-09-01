import React, { createContext, useContext, useState } from 'react';
import { CITIES } from '../data/mockData';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = localStorage.getItem('cinebook_city');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const exists = CITIES.find(c => c.id === parsed.id);
        if (exists) return exists;
      } catch (e) {}
    }
    // Default city: GUNTUR
    return CITIES.find(c => c.id === 'guntur') || CITIES[0];
  });

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('cinebook_city', JSON.stringify(city));
    setIsCityModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity: changeCity,
        changeCity,
        isCityModalOpen,
        setIsCityModalOpen,
        allCities: CITIES
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
