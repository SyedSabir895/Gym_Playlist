import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  googleToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: (googleToken: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    return data?.error || data?.message || "Request failed";
  }

  const text = await response.text().catch(() => "");
  return text.trim() || "Request failed";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");
    const savedGoogleToken = localStorage.getItem("googleToken");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedGoogleToken) setGoogleToken(savedGoogleToken);
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("googleToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
  };

  const loginWithGoogle = async (googleToken: string, userData: any) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleToken,
          email: userData.email,
          fullName: userData.name,
          googleId: userData.sub,
        }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      setGoogleToken(googleToken);
      
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("googleToken", googleToken);
    } catch (err) {
      console.error("Google sync error:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setGoogleToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("googleToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, googleToken, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
