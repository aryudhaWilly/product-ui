import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api", // Replace with your API URL
});

// Static token
const AUTH_TOKEN = "pt-indo-emkay-abadi";

// Add a request interceptor to include the static token
apiClient.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${AUTH_TOKEN}`; // Attach the static token
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
