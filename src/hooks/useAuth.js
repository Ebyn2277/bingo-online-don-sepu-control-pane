import { useEffect, useState } from "react";
import { authService } from "../services/api";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await authService.logout(token);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      localStorage.removeItem("token");
      setIsLoggedIn(false);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
  };

  const getToken = () => localStorage.getItem("token");

  return { isLoggedIn, login, logout, getToken };
};
