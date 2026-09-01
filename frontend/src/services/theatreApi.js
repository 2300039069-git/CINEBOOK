import api from './api';
import { THEATRES } from '../data/mockData';

export const theatreApi = {
  getTheatres: async (city) => {
    try {
      return await api.get('/theatres', { params: { city } });
    } catch (err) {
      if (city) return THEATRES.filter(t => t.city === city || t.city === 'mumbai');
      return THEATRES;
    }
  },

  getTheatreById: async (id) => {
    try {
      return await api.get(`/theatres/${id}`);
    } catch (err) {
      return THEATRES.find(t => t.id === id) || THEATRES[0];
    }
  }
};
