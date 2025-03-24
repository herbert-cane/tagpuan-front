import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("authToken");
        console.log("Token retrieved from SecureStore:", storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };
    loadToken();
  }, []);  

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("https://tagpuan-back.onrender.com/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error("Login failed. Check credentials.");
      }
  
      const data = await response.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        await SecureStore.setItemAsync("authToken", data.accessToken);
        router.push('/homepage')
        console.log("Token stored:", data.accessToken);
      } else {
        console.error("Token not found in response:", data);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync("authToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;