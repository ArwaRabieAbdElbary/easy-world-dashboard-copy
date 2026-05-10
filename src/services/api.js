import axios from "axios";

const api = axios.create({
  baseURL: "https://easyworld-001-site1.jtempurl.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ========================
// Request Interceptor
// ========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ========================
// Response Interceptor
// ========================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "https://easyworld-001-site1.jtempurl.com/api/dashboard/admin/refreshtoken",
          {
            refreshToken,
          },
        );

        console.log("Refreshing token..."); 
        const newAccessToken = res.data.data.accessToken;

        console.log("New token:", newAccessToken); 

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
