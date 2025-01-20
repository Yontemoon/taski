import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  user: User | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;
  const [error, setError] = useState<string | null>(null);

  // Fetch user on mount
  useEffect(() => {
    const fetchInitialUser = async () => {
      try {
        const fetchedUser = (await supabase.auth.getUser()).data.user;

        console.log("FETCHED USER", fetchedUser);
        setUser(fetchedUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user");
      }
    };

    fetchInitialUser();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log(email, password, "in signin");
    setError(null);
    try {
      const signedInUser = await supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .then((r) => r.data.user);
      setUser(signedInUser);
      return signedInUser;
    } catch (err: any) {
      console.error("Error signing in:", err.message);
      setError(err.message);
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
    } catch (err: any) {
      console.error("Error signing out:", err);
      setError(err.message);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setError(null);
    try {
      const fetchedUser = await supabase.auth
        .refreshSession()
        .then((r) => r.data.user);
      setUser(fetchedUser);
    } catch (err) {
      console.error("Error refreshing user:", err);
      setError("Failed to refresh user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, error, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
