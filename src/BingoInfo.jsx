import "./BingoInfo.css";

export function BingoInfo({
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
}) {
  return (
    <>
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
    </>
  );
}
