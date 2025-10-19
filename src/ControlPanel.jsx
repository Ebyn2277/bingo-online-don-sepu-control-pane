import { useState, useRef } from "react";
import { useBingoInfo } from "./hooks/useBingoInfo";
import { useLines } from "./hooks/useLines";
import "./ControlPanel.css";
import { BingoInfo } from "./BingoInfo.jsx";
import { LinesMenu } from "./LinesMenu.jsx";

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

  const checkInSelectedPurchases = (purchase) =>
    selectedPurchases?.some((s) => s.id === purchase.id);

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
        <LinesMenu linesRef={linesRef}></LinesMenu>
        <ul className="lines" ref={linesRef}>
          {totalLines &&
            Array.from({ length: totalLines }).map((_, i) => {
              // Get all purchases for this line
              const linePurchases = lines.filter(
                (line) => line.line_id === i + 1
              );
              return (
                <li key={i}>
                  <span>{i + 1}.</span>
                  <ul className="users">
                    {Array.from({
                      length: maxPurchasesPerLine,
                    }).map((_, j) => {
                      if (j < linePurchases.length) {
                        return (
                          <li
                            key={j}
                            className={`${linePurchases[j].state} ${
                              checkInSelectedPurchases(linePurchases[j])
                                ? "selected"
                                : ""
                            }`}
                          >
                            <button
                              onClick={() => {
                                if (
                                  checkInSelectedPurchases(linePurchases[j])
                                ) {
                                  setSelectedPurchases((prev) =>
                                    prev.filter(
                                      (s) => s.id !== linePurchases[j].id
                                    )
                                  );
                                } else {
                                  setSelectedPurchases((prev) => [
                                    ...prev,
                                    linePurchases[j],
                                  ]);
                                }
                              }}
                            >
                              {linePurchases[j].user.name}
                            </button>
                          </li>
                        );
                      } else {
                        /** TODO: Check if this else is neccesary */
                        return (
                          <li key={j} className="available">
                            <button
                            /**
                                onClick={() => {
                                  setSelectedLine({
                                    lineId: i + 1,
                                    column: line[j]?.column,
                                  });
                                  setSelectedUser(
                                    line[j]?.user ? line[j].user.id : null
                                  );
                                }}
                              */
                            >
                              Disponible
                            </button>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </li>
              );
            })}
        </ul>
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
