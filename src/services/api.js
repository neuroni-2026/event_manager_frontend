import axios from 'axios';

// Cream o instanta Axios cu adresa de baza a serverului tau Java
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Configurația inițială
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor: Adauga automat Token-ul la fiecare cerere (daca suntem logati)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Luam cheia din buzunarul browserului
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // O atasam la cerere
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;