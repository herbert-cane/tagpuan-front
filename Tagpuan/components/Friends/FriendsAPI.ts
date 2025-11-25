// api.ts
import axios from "axios";
import { auth } from "@/firebaseConfig";

// 1. Log the URL to debug the 404
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("API BASE URL:", BASE_URL); 

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  // 2. Log the full path being requested
  const fullUrl = `${config.baseURL || ''}${config.url}`;
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`);
  
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------- API ROUTES ----------------------

// SEARCH USERS
export const searchUsers = async (query: string) => {
  const response = await api.get(`/user/search?query=${query}`);
  return response.data;
};

// SEND REQUEST
export const sendFriendRequest = async (receiverId: string) => {
  // Matches backend: router.post("/friends/send") inside app.use("/user")
  const response = await api.post(`/user/friends/send`, { receiverId });
  return response.data;
};

// ACCEPT REQUEST
export const acceptFriendRequest = async (requesterId: string) => {
  const response = await api.post(`/user/friends/accept`, { requesterId });
  return response.data;
};

// REJECT REQUEST
export const rejectFriendRequest = async (requesterId: string) => {
  const response = await api.post(`/user/friends/reject`, { requesterId });
  return response.data;
};

// GET FRIEND REQUESTS
export const getFriendRequests = async () => {
  const response = await api.get(`/user/friends/requests`);
  return response.data;
};

// GET FRIEND LIST
export const getFriends = async () => {
  const response = await api.get(`/user/friends/list`);
  return response.data;
};

export default api;