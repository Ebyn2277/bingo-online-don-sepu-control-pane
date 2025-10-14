import { useEffect, useState, useRef } from "react";
import { bingoService } from "../services/api";

export const useBingoInfo = (isLoggedIn, token) => {
  const [maxLinesPerUser, setMaxLinesPerUser] = useState("");
  const [maxPurchasesPerLine, setMaxPurchasesPerLine] = useState("");
  const [pricePerLine, setPricePerLine] = useState("");
  const [totalLines, setTotalLines] = useState("");
  const [active, setActive] = useState(false);

  const isFirstUpdate = useRef(true);

  // Fetch bingo info on login
  useEffect(() => {
    if (isLoggedIn && token) {
      const fetchBingoInfo = async () => {
        try {
          const response = await bingoService.getInfo(token);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          setMaxLinesPerUser(data.max_lines_per_user ?? "");
          setMaxPurchasesPerLine(data.max_purchases_per_line ?? "");
          setPricePerLine(data.line_price ?? "");
          setTotalLines(data.total_lines ?? "");
          setActive(data.active ?? false);
        } catch (error) {
          console.error("Fetch bingo info error:", error);
        }
      };

      fetchBingoInfo();
    } else {
      setMaxLinesPerUser("");
      setMaxPurchasesPerLine("");
      setPricePerLine("");
      setTotalLines("");
      setActive(false);
    }
  }, [isLoggedIn, token]);

  // Auto-save when values change
  useEffect(() => {
    if (
      !isLoggedIn ||
      maxLinesPerUser === "" ||
      maxPurchasesPerLine === "" ||
      pricePerLine === "" ||
      totalLines === ""
    ) {
      return;
    }

    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      return;
    }

    const bingoData = {
      max_lines_per_user: maxLinesPerUser,
      max_purchases_per_line: maxPurchasesPerLine,
      line_price: pricePerLine,
      total_lines: totalLines,
      active: active,
    };

    const fetchBingoInfo = async () => {
      try {
        const response = await bingoService.updateInfo(token, bingoData);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        console.log("Bingo info updated successfully");
      } catch (error) {
        console.error("Update bingo info error:", error);
      }
    };

    fetchBingoInfo();
  }, [
    maxLinesPerUser,
    maxPurchasesPerLine,
    pricePerLine,
    totalLines,
    active,
    isLoggedIn,
    token,
  ]);

  return {
    maxLinesPerUser,
    setMaxLinesPerUser,
    maxPurchasesPerLine,
    setMaxPurchasesPerLine,
    pricePerLine,
    setPricePerLine,
    totalLines,
    setTotalLines,
    active,
    setActive,
  };
};
