import api from './api';
import { SAMPLE_SHOWTIMES } from '../data/mockData';

export const showApi = {
  getShows: async (params = {}) => {
    try {
      return await api.get('/shows', { params });
    } catch (err) {
      let results = [...SAMPLE_SHOWTIMES];
      if (params.movie_id) results = results.filter(s => s.movieId === params.movie_id);
      return results;
    }
  },

  getShowById: async (id) => {
    try {
      return await api.get(`/shows/${id}`);
    } catch (err) {
      return SAMPLE_SHOWTIMES.find(s => s.id === id) || SAMPLE_SHOWTIMES[0];
    }
  }
};
