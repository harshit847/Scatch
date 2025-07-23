import axios from "axios";

const api = axios.create({
  baseURL: "https://bags-app-by-harshit.onrender.com", 
  withCredentials: true, 
});

export default api;
