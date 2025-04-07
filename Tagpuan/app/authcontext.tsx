import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { Text, SafeAreaView } from "react-native";

// Define the token payload interface
interface JwtPayload {
  exp: number;
}

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture: string,
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("authToken");
        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          scheduleAutoLogout(storedToken);
          await fetchUserDetails(storedToken);
        } else {
          await logout();
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };

    loadAuthData();
  }, []);

  const fetchUserDetails = async (token: string) => {
    try {
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");

      const userData: User = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUser(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error("Invalid credentials"); // Throw here to trigger catch in handleLogin
      }
  
      const data = await response.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        await SecureStore.setItemAsync("authToken", data.accessToken);
        scheduleAutoLogout(data.accessToken);
        await fetchUserDetails(data.accessToken);
        router.push("/homepage");
      } else {
        throw new Error("No token found in response");
      }
    } catch (error) {
      console.error("Error during login:", error);
      throw error; //
    }
  };
  

  const scheduleAutoLogout = (token: string) => {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn > 0) {
        setTimeout(() => {
          console.log("Token expired, logging out...");
          logout();
        }, expiresIn);
      }
    } catch (error) {
      console.error("Error scheduling auto-logout:", error);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    try {
      await fetch(`${apiUrl}/user/logout`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).then(() => {console.log("User logged out.")});
      await SecureStore.deleteItemAsync("authToken");
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
