import { useEffect, useState, useRef } from "react";
import "./App.css";

const endpoint = "https://chem-mothers-colon-renew.trycloudflare.com/api/";
const header = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const fetchLogin = async (email, password) => {
  try {
    const response = await fetch(endpoint + "admin/login", {
      method: "POST",
      headers: header,
      body: JSON.stringify({ email, password }),
    });
    console.log("Login response:", response);
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

const fetchLogout = async (token) => {
  try {
    const response = await fetch(endpoint + "admin/logout", {
      method: "POST",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Logout response:", response);
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

const fetchGetBingoInfo = async (token) => {
  try {
    const response = await fetch(endpoint + "bingo/get/admin", {
      method: "GET",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Bingo info response:", response);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bingo info:", error);
    throw error;
  }
};

const fetchUpdateBingoInfo = async (token, bingoData) => {
  try {
    const response = await fetch(endpoint + "bingo/update", {
      method: "POST",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bingoData),
    });
    console.log("Update bingo info response:", response);
    return response;
  } catch (error) {
    console.error("Error updating bingo info:", error);
    throw error;
  }
};

const fetchCurrentLines = async (token) => {
  try {
    const res = await fetch(endpoint + "lines/current/admin", {
      method: "GET",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Error fetching current lines:", err);
    return null;
  }
};

const fetchUpdateLineState = async (lineId, userId, newState, token) => {
  try {
    const response = await fetch(endpoint + `lines/update`, {
      method: "POST",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        state: newState,
        line_id: lineId,
        user_id: userId,
      }),
    });
    console.log("Update line state response:", response);
    return response;
  } catch (error) {
    console.error("Error updating line state:", error);
    throw error;
  }
};

const fetchCancelLinePurchase = async (lineId, userId, token) => {
  try {
    const response = await fetch(endpoint + `lines`, {
      method: "DELETE",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, line_id: lineId }),
    });
    console.log("Cancel line purchase response:", response);
    return response;
  } catch (error) {
    console.error("Error cancelling line purchase:", error);
    throw error;
  }
};

const fetchResetLines = async (token) => {
  try {
    const response = await fetch(endpoint + `bingo/reset`, {
      method: "POST",
      headers: {
        ...header,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Reset lines response:", response);
    return response;
  } catch (error) {
    console.error("Error resetting lines:", error);
    throw error;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estados individuales para cada dato del bingo
  const [maxLinesPerUser, setMaxLinesPerUser] = useState("");
  const [maxPurchasesPerLine, setMaxPurchasesPerLine] = useState("");
  const [pricePerLine, setPricePerLine] = useState("");
  const [totalLines, setTotalLines] = useState("");
  const [active, setActive] = useState(false);

  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Ref para evitar la ejecución del useEffect en la primera renderización
  const isFirstUpdate = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      fetchGetBingoInfo(token)
        .then((data) => {
          setMaxLinesPerUser(data.max_lines_per_user ?? "");
          setMaxPurchasesPerLine(data.max_purchases_per_line ?? "");
          setPricePerLine(data.line_price ?? "");
          setTotalLines(data.total_lines ?? "");
          setActive(data.active ?? false);
        })
        .catch((error) => {
          alert("An error occurred while fetching bingo info.");
          console.error("Fetch bingo info error:", error);
        });
    } else {
      setMaxLinesPerUser("");
      setMaxPurchasesPerLine("");
      setPricePerLine("");
      setTotalLines("");
      setActive(false);
    }
  }, [isLoggedIn]);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    fetchLogin(email, password)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setIsLoggedIn(true);
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
      })
      .catch((error) => {
        alert("An error occurred during login.");
        console.error("Login error:", error);
      });
  };

  const onClickLogOutHandler = () => {
    const token = localStorage.getItem("token");
    fetchLogout(token)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      })
      .catch((error) => {
        alert("An error occurred during logout.");
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    if (
      maxLinesPerUser === "" ||
      maxPurchasesPerLine === "" ||
      pricePerLine === "" ||
      totalLines === ""
    ) {
      return; // No hacer nada si alguno de los campos está vacío
    }

    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      return; // Ignora la primera ejecución
    }
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      const bingoData = {
        max_lines_per_user: maxLinesPerUser,
        max_purchases_per_line: maxPurchasesPerLine,
        line_price: pricePerLine,
        total_lines: totalLines,
        active: active,
      };
      console.log("Updating bingo info with data:", bingoData);
      fetchUpdateBingoInfo(token, bingoData)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          console.log("Bingo info updated successfully");
        })
        .catch((error) => {
          alert("An error occurred while updating bingo info.");
          console.error("Update bingo info error:", error);
        });
    }
  }, [
    maxLinesPerUser,
    maxPurchasesPerLine,
    pricePerLine,
    totalLines,
    active,
    isLoggedIn,
  ]);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      fetchCurrentLines(token)
        .then((data) => {
          if (data) {
            setLines(data);
          } else {
            setLines([]);
          }
        })
        .catch((error) => {
          alert("An error occurred while fetching current lines.");
          console.error("Fetch current lines error:", error);
        });
    } else {
      setLines([]);
    }
  }, [isLoggedIn]);

  const onClickChangeStateHandler = (newState) => {
    if (selectedLine && newState) {
      const token = localStorage.getItem("token");
      if (newState === "available") {
        // Si la nueva estado es "available", cancelar la compra
        fetchCancelLinePurchase(selectedLine, selectedUser, token)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            // Actualizar el estado local de las líneas después de cancelar la compra
            setLines((prevLines) =>
              prevLines.map((line) =>
                line.id === selectedLine
                  ? {
                      ...line,
                      state: "available",
                      users: line.users.filter(
                        (user) => user.id != selectedUser
                      ),
                    }
                  : line
              )
            );
            setSelectedLine(null); // Cerrar el modal después de la actualización
          })
          .catch((error) => {
            alert("An error occurred while cancelling line purchase.");
            console.error("Cancel line purchase error:", error);
          });
        return;
      }

      // Para otros estados, simplemente actualizar el estado de la línea
      fetchUpdateLineState(selectedLine, selectedUser, newState, token)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          // Actualizar el estado local de las líneas después de cambiar el estado
          setLines((prevLines) =>
            prevLines.map((line) =>
              line.id === selectedLine
                ? {
                    ...line,
                    users: line.users.map((user) => {
                      if (user.id === selectedUser) {
                        console.log(
                          "Updating user state locally:",
                          user,
                          newState,
                          selectedUser
                        );
                        return {
                          ...user,
                          pivot: { ...user.pivot, state: newState },
                        };
                      }
                      return user;
                    }),
                  }
                : line
            )
          );
          setSelectedLine(null); // Cerrar el modal después de la actualización
        })
        .catch((error) => {
          alert("An error occurred while updating line state.");
          console.error("Update line state error:", error);
        });
    }
  };

  const onClickResetLinesHandler = () => {
    const token = localStorage.getItem("token");
    fetchResetLines(token)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Después de reiniciar las líneas, actualizar el estado local
        setLines([]);
      })
      .catch((error) => {
        alert("An error occurred while resetting lines.");
        console.error("Reset lines error:", error);
      });
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
                const line = lines.filter((line) => line.id === i + 1)[0];

                const users = line ? line.users : [];

                return (
                  <li key={i}>
                    <span>{i + 1}.</span>
                    <ul className="users">
                      {Array.from({
                        length: maxPurchasesPerLine,
                      }).map((_, j) => {
                        if (j < users.length) {
                          return (
                            <li key={j} className={users[j].pivot.state}>
                              <button
                                onClick={() => {
                                  setSelectedLine(i + 1);
                                  setSelectedUser(users[j].id);
                                }}
                              >
                                {users[j].name}
                              </button>
                            </li>
                          );
                        } else {
                          /** TODO: Check if this else is neccesary */
                          return (
                            <li key={j} className="available">
                              <button
                                onClick={() => {
                                  setSelectedLine(i + 1);
                                  setSelectedUser(
                                    users[j] ? users[j].id : null
                                  );
                                }}
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
                Has seleccionado la línea {selectedLine} y al usuario{" "}
                {lines
                  .find((line) => line.id == selectedLine)
                  ?.users.find((user) => user.id == selectedUser)?.name ??
                  "null"}
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
