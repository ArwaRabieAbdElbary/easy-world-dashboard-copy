import axios from "axios";

const api = axios.create({
  baseURL: "https://easyworld-001-site1.jtempurl.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}); */

export default api;
