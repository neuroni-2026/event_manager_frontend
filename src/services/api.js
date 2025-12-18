import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketApi = {
    purchase: (eventId) => {
        return api.post('/tickets/purchase', { eventId: eventId });
    },
    
    getMyTickets: () => {
        return api.get('/tickets/my-tickets');
    }
};

export const eventApi = {
    getMyEvents: () => {
        return api.get('/events/my-events');
    },

    deleteEvent: (eventId) => {
        return api.delete(`/events/${eventId}`);
    },

    updateEvent: (eventId, eventData) => {
        return api.put(`/events/${eventId}`, eventData);
    }
};

api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const token = user.token || user.accessToken || user.jwt;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {

        }

      } catch (e) {
        console.error("[API] Eroare la citirea userului din LocalStorage", e);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.error("[401] Token expirat sau invalid");

            }
            if (error.response.status === 403) {
                console.error("[403] Acces interzis (Nu ai rolul necesar)!");
            }
        }
        return Promise.reject(error);
    }
);

export default api;