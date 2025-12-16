import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});


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
          console.log("Structura obiectului user este:", user);
        }

      } catch (e) {
        console.error("[API] Eroare la citirea userului din LocalStorage", e);
      }
    } else {

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
                console.error("[401] Token expirat");
                
            }
            if (error.response.status === 403) {
                console.error("[403] Acces interzis!");
            }
        }
        return Promise.reject(error);
    }
);

export default api;