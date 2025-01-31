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
  signIn: (
    email: string,
    password: string
  ) => Promise<
    | {
        error: boolean;
        data: User;
        message?: undefined;
      }
    | {
        error: boolean;
        message: string;
        data?: undefined;
      }
  >;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const getUser = () => {
  const userInfo = localStorage.getItem("sb-udtsoseizguuxxylpzuw-auth-token");
  if (userInfo) {
    const jsonUser = JSON.parse(userInfo);
    return jsonUser.user;
  }
};

// ! Does this need be a provider? We're passing into context so it's technically available everywhere.

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialUser = async () => {
      setIsLoading(true);
      try {
        const fetchedUser = (await supabase.auth.getUser()).data.user;
        setUser(fetchedUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialUser();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      return {
        error: true,
        message: error.message,
      };
    }

    setUser(data.user);
    return {
      error: false,
      data: data.user,
    };
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
    <AuthContext.Provider
      value={{ user, error, signIn, signOut, refreshUser, isLoading }}
    >
      {isLoading ? null : children}
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
