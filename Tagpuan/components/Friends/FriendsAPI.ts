import axios from "axios";
import { auth } from "@/firebaseConfig";

const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,  // ← change this
});

// Add token if needed
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// SEARCH USERS
export const searchUsers = (query: string) =>
  api.get(`/users/search?query=${query}`).then(res => res.data);

// SEND REQUEST
export const sendFriendRequest = (receiverId: string) =>
  api.post(`/friends/send`, { receiverId }).then(res => res.data);

// ACCEPT REQUEST
export const acceptFriendRequest = (requesterId: string) =>
  api.post(`/friends/accept`, { requesterId }).then(res => res.data);

// REJECT REQUEST
export const rejectFriendRequest = (requesterId: string) =>
  api.post(`/friends/reject`, { requesterId }).then(res => res.data);

// GET FRIEND REQUESTS
export const getFriendRequests = () =>
  api.get(`/friends/requests`).then(res => res.data);

// GET FRIEND LIST
export const getFriends = () =>
  api.get(`/friends/list`).then(res => res.data);

export default api;
