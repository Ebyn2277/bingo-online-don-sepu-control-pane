import { useState, useEffect } from "react";
import { linesService, bingoService } from "../services/api";

export const useLines = (isLoggedIn, token) => {
  const [lines, setLines] = useState([]);

  const fetchLines = async () => {
    if (!token) return;

    try {
      const response = await linesService.getCurrent(token);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setLines(data || []);
    } catch (error) {
      console.error("Fetch current lines error:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchLines();
    } else {
      setLines([]);
    }
  }, [isLoggedIn, token]);

  const updateLineState = async (lineId, userId, column, newState) => {
    try {
      const response = await linesService.updateState(token, {
        lineId,
        userId,
        column,
        state: newState,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await fetchLines();
      return { success: true };
    } catch (error) {
      console.error("Update line state error:", error);
      return { success: false, error };
    }
  };

  const cancelLinePurchase = async (lineId, userId, column) => {
    try {
      const response = await linesService.cancelPurchase(token, {
        lineId,
        userId,
        column,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await fetchLines();
      return { success: true };
    } catch (error) {
      console.error("Cancel line purchase error:", error);
      return { success: false, error };
    }
  };

  const resetLines = async () => {
    try {
      const response = await bingoService.reset(token);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setLines([]);
      return { success: true };
    } catch (error) {
      console.error("Reset lines error:", error);
      return { success: false, error };
    }
  };

  return {
    lines,
    updateLineState,
    cancelLinePurchase,
    resetLines,
  };
};
