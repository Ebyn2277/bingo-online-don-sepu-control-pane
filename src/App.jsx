import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import { useBingoInfo } from "./hooks/useBingoInfo";
import { useLines } from "./hooks/useLines";
import { Login } from "./Login";

function App() {
  const { isLoggedIn, login, logout, getToken } = useAuth();
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
  const [screenshotURL, setScreenshotURL] = useState(null);

  const scrollToLines = () => {
    linesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const captureLines = async () => {
    if (linesRef.current) {
      const orignalPadding = linesRef.current.style.padding;

      linesRef.current.style.padding = "16px";

      const canvas = await html2canvas(linesRef.current, {
        backgroundColor: "#222",
        scale: 2,
      });

      linesRef.current.style.padding = orignalPadding;

      const dataUrl = canvas.toDataURL("image/png");
      setScreenshotURL(dataUrl);
    }
  };

  const onClickDownloadScreenshotHandler = () => {
    setScreenshotURL(null);
  };

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
      {isLoggedIn ? (
        <section className="control-pane">
          <h1>Panel de control</h1>
          <div className="bingo-info">
            <h2>Información del bingo</h2>
            <form className="bingo-form">
              <label>
                Numero de lineas máximas por usuario:
                <input
                  type="number"
                  value={maxLinesPerUser}
                  onChange={(e) => setMaxLinesPerUser(e.target.value)}
                />
              </label>
              <label>
                Cantidad de líneas:
                <input
                  type="number"
                  value={maxPurchasesPerLine}
                  onChange={(e) => setMaxPurchasesPerLine(e.target.value)}
                />
              </label>
              <label>
                Precio por línea:
                <input
                  type="number"
                  value={pricePerLine}
                  onChange={(e) => setPricePerLine(e.target.value)}
                />
              </label>
              <label>
                Líneas totales:
                <input
                  type="number"
                  value={totalLines}
                  onChange={(e) => setTotalLines(e.target.value)}
                />
              </label>
              <label>
                Estado de la página:
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />{" "}
                  {active ? "Activa" : "Inactiva"}
                </div>
              </label>
            </form>
          </div>
          <ul className="lines-menu">
            <li>
              <button className="center-lines-button" onClick={scrollToLines}>
                Centrar
              </button>
            </li>
            <li>
              <button className="take-screenshot-button" onClick={captureLines}>
                Capturar pantalla
              </button>
            </li>
            {screenshotURL && (
              <li className="screenshot-container">
                <a
                  href={screenshotURL}
                  download="element-screenshot.png"
                  onClick={onClickDownloadScreenshotHandler}
                >
                  <h3>Descargar</h3>
                  <img src={screenshotURL} alt="Captured Element" />
                </a>
              </li>
            )}
          </ul>
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
      ) : (
        <Login login={login}></Login>
      )}
    </>
  );
}

export default App;
