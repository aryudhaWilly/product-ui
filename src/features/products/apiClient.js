import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api/",
});

const AUTH_TOKEN = "pt-indo-emkay-abadi";

apiClient.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
