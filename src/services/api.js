import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = {
    // Evenimente
    getPendingEvents: () => api.get('/admin/pending-events'),
    getAllEvents: () => api.get('/admin/all-events'),
    approveEvent: (id) => api.put(`/admin/approve/${id}`),
    rejectEvent: (id, reason) => api.put(`/admin/reject/${id}?reason=${encodeURIComponent(reason)}`),
    deleteEvent: (id) => api.delete(`/admin/events/${id}`),

    // Organizatori & Cereri
    getOrganizerRequests: () => api.get('/admin/organizer-requests'),
    approveOrganizer: (userId) => api.post(`/admin/approve-organizer/${userId}`),
    getOrganizerStats: () => api.get('/admin/organizers/stats'),
    
    // Acțiuni Utilizatori/Organizatori (Logica cerută de tine)
    suspendUser: (userId, days) => api.post(`/admin/organizers/${userId}/suspend?days=${days}`),
    unsuspendUser: (userId) => api.post(`/admin/organizers/${userId}/unsuspend`),
    toggleBan: (userId) => api.post(`/admin/organizers/${userId}/ban`),
    downgradeUser: (userId) => api.post(`/admin/organizers/${userId}/downgrade`),

    // Utilizatori & Recenzii
    getAllUsers: () => api.get('/admin/users'),
    getAllReviews: () => api.get('/admin/reviews'),
    deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),

    // Rapoarte
    getReports: () => api.get('/admin/reports'),
};
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

export const notificationApi = {
    getAll: () => {
        return api.get('/notifications');
    },
    markRead: (id) => {
        
        return api.put(`/notifications/${id}/read`, {});
    },
    getUnreadCount: () => {
        return api.get('/notifications/count');
    }
};

api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    
  
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
       
        const token = user.token || user.accessToken || user.jwt || (user.data && user.data.token);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("ATENTIE: Userul exista, dar nu gasesc token-ul!");
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
            console.error(`[API Error] ${error.config.method.toUpperCase()} ${error.config.url} -> ${error.response.status}`);
            
            if (error.response.status === 401) {
                console.error("[401] Token expirat sau invalid");
            }
            if (error.response.status === 403) {
                console.error("[403] Acces interzis (Nu ai rolul necesar)!");
            }
        } else if (error.request) {
            console.error("Nu s-a primit niciun răspuns de la server. Verifică dacă backend-ul Java rulează!");
        }
        return Promise.reject(error);
    }
);

export default api;