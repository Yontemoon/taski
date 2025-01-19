import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { fetchUser, signInUser, signOutUser } from "@/lib/server/user";
import { User } from "@supabase/supabase-js";

// Define the Auth context shape
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user on mount
  useEffect(() => {
    const fetchInitialUser = async () => {
      setLoading(true);
      try {
        const fetchedUser = await fetchUser();
        console.log("FETCHED USER", fetchedUser);
        setUser(fetchedUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialUser();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    console.log(email, password, "in signin");
    setLoading(true);
    setError(null);
    try {
      const data = { email, password };
      const signedInUser = await signInUser(data);
      setUser(signedInUser);
      return signedInUser;
    } catch (err: any) {
      console.error("Error signing in:", err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await signOutUser();
      if (success) {
        setUser(null);
      }
    } catch (err: any) {
      console.error("Error signing out:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUser = await fetchUser();
      setUser(fetchedUser);
    } catch (err) {
      console.error("Error refreshing user:", err);
      setError("Failed to refresh user");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
