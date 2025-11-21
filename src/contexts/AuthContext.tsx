import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "admin" | "staff";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@delivery-pro:user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se existe um usuário armazenado e redireciona para o dashboard
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
      navigate("/dashboard");
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc("authenticate_user", {
        p_email: email,
        p_password: password,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const userData = data[0];
        const userObject = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
        };

        setUser(userObject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userObject));

        navigate("/dashboard");
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Delivery Max!",
        });
      } else {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error } = await supabase.rpc("create_user", {
        p_email: email,
        p_password: password,
        p_first_name: firstName,
        p_last_name: lastName,
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login",
      });

      navigate("/login");
    } catch (error) {
      console.error("Error during signup:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao tentar criar sua conta",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    navigate("/login");
    toast({
      title: "Logout realizado com sucesso",
      description: "Até logo!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
