import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { BookingProvider } from './context/BookingContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LocationProvider>
          <AuthProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </AuthProvider>
        </LocationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
