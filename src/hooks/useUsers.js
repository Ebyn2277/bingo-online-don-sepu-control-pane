import { useState, useEffect, useCallback } from "react";
import { usersService } from "../services/api"; // <-- Ajusta la ruta a donde tengas tus servicios

export function useUsers(isLoggedIn, token) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Usamos useCallback para que la función sea estable y no genere loops infinitos en el useEffect
  const fetchUsers = useCallback(async () => {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    try {
      const response = await usersService.getAll(token);

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Error en respuesta de usuarios:", response.status);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  const deleteUser = async (userId) => {
    try {
      const response = await usersService.delete(token, userId);

      if (response.ok) {
        // Remover de la lista local inmediatamente para actualizar la UI sin recargar
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Error eliminando usuario en el hook:", error);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, deleteUser, refetchUsers: fetchUsers };
}
