import axios from 'axios';

// Créer une instance Axios pour configurer l'URL de base de l'API backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // Change cette URL si le backend est déployé ailleurs
  timeout: 5000, // Timeout pour les requêtes
});


export default api;
