import React, { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser, registerUser, getCurrentUser, verifyDID } from "../auth/auth.functions";
import { clearAuthToken, getAuthToken, setAuthToken } from "../auth/session";

interface User {
  id: string;
  did: string;
  ridScore: number;
  reputationHistory: any[];
  mpesaNumber?: string;
  walletAddress?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (did: string, signature: string, message: string) => Promise<void>;
  register: (did: string, email?: string, mpesaNumber?: string, walletAddress?: string) => Promise<void>;
  logout: () => void;
  verifyDID: (did: string, verificationMethod: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.warn("Failed to restore session:", error);
        clearAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (did: string, signature: string, message: string) => {
    setIsLoading(true);
    try {
      const result = await authenticateUser({ data: { did, signature, message } });
      setAuthToken(result.token);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (did: string, email?: string, mpesaNumber?: string, walletAddress?: string) => {
    setIsLoading(true);
    try {
      const result = await registerUser({ data: { did, email, mpesaNumber, walletAddress } });
      setAuthToken(result.token);
      setUser(result.user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const verifyUserDID = async (did: string, verificationMethod: string) => {
    try {
      const result = await verifyDID({ data: { did, verificationMethod } });
      if (user) {
        setUser({
          ...user,
          ridScore: result.ridScore,
        });
      }
    } catch (error) {
      console.error("DID verification failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyDID: verifyUserDID,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};