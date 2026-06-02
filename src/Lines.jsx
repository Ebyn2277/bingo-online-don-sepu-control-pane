import "./Lines.css";

export function Lines({
  lines,
  linesRef,
  totalLines,
  maxPurchasesPerLine,
  selectedPurchases,
  setSelectedPurchases,
  selectIndividual, // RECIBIMOS LA PROP
}) {
  const checkInSelectedPurchases = (purchase) =>
    selectedPurchases?.some((s) => s.id === purchase.id);

  return (
    <>
      <ul className="lines" ref={linesRef}>
        {totalLines &&
          Array.from({ length: totalLines }).map((_, i) => {
            const linePurchases = lines.filter(
              (line) => line.line_id === i + 1,
            );
            return (
              <li key={i}>
                <span>{i + 1}.</span>
                <ul className="users">
                  {Array.from({
                    length: maxPurchasesPerLine,
                  }).map((_, j) => {
                    if (j < linePurchases.length) {
                      const currentPurchase = linePurchases[j];
                      const isSelected =
                        checkInSelectedPurchases(currentPurchase);

                      return (
                        <li
                          key={j}
                          className={`${currentPurchase.state} ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <button
                            onClick={() => {
                              const userId = currentPurchase.user.id;

                              if (isSelected) {
                                if (selectIndividual) {
                                  // UNO POR UNO: Deselecciona solo esta celda
                                  setSelectedPurchases((prev) =>
                                    prev.filter(
                                      (s) => s.id !== currentPurchase.id,
                                    ),
                                  );
                                } else {
                                  // MASIVO: Deselecciona todo lo que sea de este usuario
                                  setSelectedPurchases((prev) =>
                                    prev.filter((s) => s.user.id !== userId),
                                  );
                                }
                              } else {
                                if (selectIndividual) {
                                  // UNO POR UNO: Agrega únicamente esta celda
                                  setSelectedPurchases((prev) => [
                                    ...prev,
                                    currentPurchase,
                                  ]);
                                } else {
                                  // MASIVO: Busca todas las compras de este usuario en el juego
                                  const allUserPurchases = lines.filter(
                                    (line) => line.user.id === userId,
                                  );

                                  // Las inserta en el estado omitiendo duplicados existentes
                                  setSelectedPurchases((prev) => {
                                    const existingIds = new Set(
                                      prev.map((p) => p.id),
                                    );
                                    const newPurchases =
                                      allUserPurchases.filter(
                                        (p) => !existingIds.has(p.id),
                                      );
                                    return [...prev, ...newPurchases];
                                  });
                                }
                              }
                            }}
                          >
                            {currentPurchase.user.name}
                          </button>
                        </li>
                      );
                    } else {
                      return (
                        <li key={j} className="available">
                          <button disabled>Disponible</button>
                        </li>
                      );
                    }
                  })}
                </ul>
              </li>
            );
          })}
      </ul>
    </>
  );
}
