import { useState, useRef } from "react";
import { useBingoInfo } from "./hooks/useBingoInfo";
import { useLines } from "./hooks/useLines";
import { useUsers } from "./hooks/useUsers"; // 1. Importamos el nuevo hook
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
    token,
  );

  const [isTableVisible, setIsTableVisible] = useState(false); // Inicia oculto para ahorrar espacio

  // 2. Consumimos el hook de usuarios y creamos el estado del buscador
  const { users, loading, deleteUser } = useUsers(isLoggedIn, token);
  const [searchTerm, setSearchTerm] = useState("");

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
        selectedPurchases.map((s) => ({ id: s.id, state: newState })),
      );
    }

    if (result.success) {
      setSelectedPurchases([]);
      setIsConfirmStateChange(false);
    } else {
      alert(
        `An error occurred while ${
          newState === "available" ? "cancelling" : "updating"
        } line.`,
      );
    }
  };

  const onClickResetLinesHandler = async () => {
    const isResetConfirmed = window.confirm(
      "Estás seguro de que quieres reiniciar las líneas?",
    );

    if (!isResetConfirmed) return;

    const result = await resetLines();
    if (!result.success) {
      alert("Un error ha ocurrido mientras se reiniciaban las líneas.");
    } else {
      alert("Las líneas han sido reseteadas correctamente.");
    }
  };

  // 3. Manejador para eliminar usuario con confirmación nativa
  const handleDeleteUserClick = async (userId, userName) => {
    const isConfirmed = window.confirm(
      `¿Estás completamente seguro de eliminar al usuario "${userName}"? Esto revocará todos sus tokens y liberará sus líneas.`,
    );
    if (!isConfirmed) return;

    const result = await deleteUser(userId);
    if (result.success) {
      alert("Usuario eliminado con éxito.");
    } else {
      alert("No se pudo eliminar al usuario.");
    }
  };

  // 4. Filtrado en tiempo real por Nombre o Teléfono
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name
      ? user.name.toLowerCase().includes(term)
      : false;
    const matchesPhone = user.phone ? user.phone.includes(term) : false;
    return matchesName || matchesPhone;
  });

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

        <Lines
          lines={lines}
          linesRef={linesRef}
          totalLines={totalLines}
          maxPurchasesPerLine={maxPurchasesPerLine}
          selectedPurchases={selectedPurchases}
          setSelectedPurchases={setSelectedPurchases}
        ></Lines>

        {selectedPurchases.length > 0 && (
          <div className="confirm-state-change-button-container">
            <button
              className="confirm-state-change-button"
              onClick={() => setIsConfirmStateChange(true)}
            >
              Cambiar Estado ({selectedPurchases.length} compra
              {selectedPurchases.length > 1 ? "s" : ""} seleccionada
              {selectedPurchases.length > 1 ? "s" : ""})
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
            <div>
              <p>
                {selectedPurchases.length === 1
                  ? `Has seleccionado la línea ${selectedPurchases[0].line_id} y al usuario `
                  : `Has seleccionado los siguientes registros (linea, usuario): `}
              </p>
              <div className="selected-purchases-list">
                {selectedPurchases.map((s) => (
                  <li key={s.id} className={s.state}>
                    ({s.line_id}, {s.user.name})
                  </li>
                ))}
              </div>
            </div>
            <div>
              <p>Total de compras seleccionadas:</p>
              <p>{selectedPurchases.length}</p>
            </div>
            <ul>
              <li>
                <button
                  className="mark-purchased-button"
                  onClick={() => onClickChangeStateHandler("purchased")}
                >
                  Marcar compras como pagadas
                </button>
              </li>
              <li>
                <button
                  className="mark-requested-button"
                  onClick={() => onClickChangeStateHandler("requested")}
                >
                  Marcar compras como reservadas
                </button>
              </li>
              <li>
                <button
                  className="mark-available-button"
                  onClick={() => onClickChangeStateHandler("available")}
                >
                  Anular compras
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* ================================================================= */
        /* NUEVA SECCIÓN: GESTIÓN DE USUARIOS (CON MUTADOR DE VISIBILIDAD)   */
        /* ================================================================= */}
        <section className="users-management-section">
          <div className="users-management-header">
            <h2>Gestión de Usuarios</h2>
            <button
              type="button"
              className="toggle-table-button"
              onClick={() => setIsTableVisible(!isTableVisible)}
            >
              {isTableVisible ? "Ocultar Panel ▲" : "Mostrar Panel ▼"}
            </button>
          </div>

          {/* Si isTableVisible es true, se renderiza el buscador y la tabla */}
          {isTableVisible && (
            <>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="user-search-input"
                />
              </div>

              {loading ? (
                <p>Cargando usuarios...</p>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Bingo ID</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.phone || "N/A"}</td>
                            <td>{user.bingo_id}</td>
                            <td>
                              <button
                                className="delete-user-button"
                                onClick={() =>
                                  handleDeleteUserClick(user.id, user.name)
                                }
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No se encontraron usuarios
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
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
