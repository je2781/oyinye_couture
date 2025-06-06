// lib/api.ts
import axios from "axios";

const api = axios.create({
  withCredentials: true,
});

// Set default headers separately if needed
api.defaults.headers.common["Content-Type"] = "application/json";


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry // prevent infinite loop
    ) {
      originalRequest._retry = true;

      const reqCookies =
        originalRequest.headers?.Cookie ||
        originalRequest.headers?.cookie ||
        "";
      const hasSessionCookie = reqCookies.includes("session=");

      try {
        if (hasSessionCookie) {
          const tokenRes = await api.get(
            `${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/api/auth/token`
          );
          const res = await api.post(
            `${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/api/auth/refresh`,
            {
              headers: {
                "x-csrf-token": tokenRes.data.token,
              },
            }
          );

          // Apply new access token to retried request
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${res.data.accessToken}`;
          // Apply new CSRF token to retried request
          originalRequest.headers["x-csrf-token"] = tokenRes.data.token;
        } else {
          const tokenRes = await api.get(
            `${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/api/auth/token`
          );
          await api.get(
            `${process.env.NEXT_PUBLIC_AUTH_DOMAIN}/api/auth/guest-token`
          );
          // Apply new CSRF token to retried request
          originalRequest.headers["x-csrf-token"] = tokenRes.data.token;
   
        }

        return api(originalRequest); // retry original request ONCE
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
