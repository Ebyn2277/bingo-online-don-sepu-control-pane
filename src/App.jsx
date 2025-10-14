import { useState } from "react";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import { useBingoInfo } from "./hooks/useBingoInfo";
import { useLines } from "./hooks/useLines";

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

  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const result = await login(email, password);
    if (!result.success) {
      alert("An error occurred during login.");
    }
  };

  const onClickLogOutHandler = async () => {
    const result = await logout();
    if (!result.success) {
      alert("An error occurred during logout.");
    }
  };

  const onClickChangeStateHandler = (newState) => {
    if (!selectedLine || !newState) return;

    let result;
    if (newState === "available") {
      result = cancelLinePurchase(
        selectedLine.lineId,
        selectedUser,
        selectedLine.column
      );
    } else {
      result = updateLineState(
        selectedLine.lineId,
        selectedUser,
        selectedLine.column,
        newState
      );
    }

    if (result.success) {
      setSelectedLine(null);
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
          <ul className="lines">
            {totalLines &&
              Array.from({ length: totalLines }).map((_, i) => {
                // Get all purchases for this line
                const line = lines.filter((line) => line.line_id === i + 1);

                return (
                  <li key={i}>
                    <span>{i + 1}.</span>
                    <ul className="users">
                      {Array.from({
                        length: maxPurchasesPerLine,
                      }).map((_, j) => {
                        if (j < line.length) {
                          return (
                            <li key={j} className={line[j].state}>
                              <button
                                onClick={() => {
                                  setSelectedLine({
                                    lineId: i + 1,
                                    column: line[j].column,
                                  });
                                  setSelectedUser(line[j].user.id);
                                }}
                              >
                                {line[j].user.name}
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
          {selectedLine && (
            <div className="change-state-modal">
              <span className="close" onClick={() => setSelectedLine(null)}>
                &times;
              </span>
              <p>
                Has seleccionado la línea {selectedLine.lineId} y al usuario{" "}
                {lines.find((line) => line.line_id === selectedLine.lineId)
                  ?.user?.name ?? "null"}
                .
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
          <button onClick={onClickResetLinesHandler}>Reiniciar líneas</button>
          <button onClick={onClickLogOutHandler}>Cerrar Sesion</button>
        </section>
      ) : (
        <section className="login">
          <h1>Iniciar Sesión</h1>
          <form className="login-form" onSubmit={onSubmitHandler}>
            <label htmlFor="email">Correo:</label>
            <input type="email" name="email" required />
            <label htmlFor="password">Contraseña:</label>
            <input type="password" name="password" required />
            <button type="submit">Iniciar Sesión</button>
          </form>
        </section>
      )}
    </>
  );
}

export default App;
