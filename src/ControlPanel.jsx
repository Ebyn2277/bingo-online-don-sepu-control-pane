import { useState, useRef } from "react";
import { useBingoInfo } from "./hooks/useBingoInfo";
import { useLines } from "./hooks/useLines";
import "./ControlPanel.css";
import { BingoInfo } from "./BingoInfo.jsx";
import { LinesMenu } from "./LinesMenu.jsx";
import { Lines } from "./Lines.jsx";

export function ControlPanel({ isLoggedIn, logout, getToken }) {
  const token = getToken();

  const {
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
  } = useBingoInfo(isLoggedIn, token);

  const { lines, updateLineState, cancelLinePurchase, resetLines } = useLines(
    isLoggedIn,
    token
  );

  const [selectedPurchases, setSelectedPurchases] = useState([]);

  const [isConfirmStateChange, setIsConfirmStateChange] = useState(false);

  const linesRef = useRef(null);

  const onClickLogOutHandler = async () => {
    const result = await logout();
    if (!result.success) {
      alert("An error occurred during logout.");
    }
  };

  const onClickChangeStateHandler = async (newState) => {
    if (selectedPurchases.length === 0) return;

    let result;
    if (newState === "available") {
      result = await cancelLinePurchase(selectedPurchases.map((s) => s.id));
    } else {
      result = await updateLineState(
        selectedPurchases.map((s) => ({ id: s.id, state: newState }))
      );
    }

    if (result.success) {
      setSelectedPurchases([]);
      setIsConfirmStateChange(false);
    } else {
      alert(
        `An error occurred while ${
          newState === "available" ? "cancelling" : "updating"
        } line.`
      );
    }
  };

  const onClickResetLinesHandler = async () => {
    const result = await resetLines();
    if (!result.success) {
      alert("An error occurred while resetting lines.");
    }
  };

  return (
    <>
      <section className="control-panel">
        <h1>Panel de control</h1>
        <BingoInfo
          maxLinesPerUser={maxLinesPerUser}
          setMaxLinesPerUser={setMaxLinesPerUser}
          maxPurchasesPerLine={maxPurchasesPerLine}
          setMaxPurchasesPerLine={setMaxPurchasesPerLine}
          pricePerLine={pricePerLine}
          setPricePerLine={setPricePerLine}
          totalLines={totalLines}
          setTotalLines={setTotalLines}
          active={active}
          setActive={setActive}
        ></BingoInfo>
        <LinesMenu
          lines={lines}
          linesRef={linesRef}
          totalLines={totalLines}
          maxPurchasesPerLine={maxPurchasesPerLine}
          selectedPurchases={selectedPurchases}
          setSelectedPurchases={setSelectedPurchases}
        ></LinesMenu>
        <Lines lines={lines} linesRef={linesRef}></Lines>
        {selectedPurchases.length > 0 && (
          <div className="confirm-state-change-button-container">
            <button
              className="confirm-state-change-button"
              onClick={() => setIsConfirmStateChange(true)}
            >
              Cambiar Estado
            </button>
          </div>
        )}
        {isConfirmStateChange && (
          <div className="change-state-modal">
            <span
              className="close"
              onClick={() => {
                setIsConfirmStateChange(false);
                setSelectedPurchases([]);
              }}
            >
              &times;
            </span>
            <p>
              {selectedPurchases.length === 1
                ? `Has seleccionado la línea ${selectedPurchases[0].line_id} y al usuario ${selectedPurchases[0].user.name}`
                : `Has seleccionado los siguientes registros (linea, usuario): ${selectedPurchases.map(
                    (s) => `(${s.line_id}, ${s.user.name})`
                  )}`}
            </p>
            <ul>
              <li>
                <button
                  onClick={() => {
                    onClickChangeStateHandler("purchased");
                  }}
                >
                  Marcar como pagada
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onClickChangeStateHandler("requested");
                  }}
                >
                  Marcar como reservada
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onClickChangeStateHandler("available");
                  }}
                >
                  Anular compra
                </button>
              </li>
            </ul>
          </div>
        )}
        <button
          className="lines-restart-button"
          onClick={onClickResetLinesHandler}
        >
          Reiniciar líneas
        </button>
        <button className="logout-button" onClick={onClickLogOutHandler}>
          Cerrar Sesion
        </button>
      </section>
    </>
  );
}
