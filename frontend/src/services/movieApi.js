import api from './api';
import { MOVIES } from '../data/mockData';

export const movieApi = {
  getMovies: async (params = {}) => {
    try {
      return await api.get('/movies', { params });
    } catch (err) {
      console.warn('Backend offline, using mock movies:', err.message);
      let results = [...MOVIES];
      if (params.status) results = results.filter(m => m.status === params.status);
      if (params.genre && params.genre !== 'All') results = results.filter(m => m.genres.includes(params.genre));
      if (params.city) results = results.filter(m => m.cities.includes(params.city));
      return results;
    }
  },

  getFeaturedMovies: async () => {
    try {
      return await api.get('/movies/featured');
    } catch (err) {
      return MOVIES.filter(m => m.isFeatured);
    }
  },

  getMovieBySlug: async (slug) => {
    try {
      return await api.get(`/movies/${slug}`);
    } catch (err) {
      return MOVIES.find(m => m.slug === slug || m.id === slug) || MOVIES[0];
    }
  }
};
