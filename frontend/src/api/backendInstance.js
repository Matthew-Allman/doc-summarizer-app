import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const backendAPI = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

export default backendAPI;
