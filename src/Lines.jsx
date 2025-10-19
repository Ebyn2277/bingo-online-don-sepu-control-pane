import "./Lines.css";

export function Lines({
  lines,
  linesRef,
  totalLines,
  maxPurchasesPerLine,
  selectedPurchases,
  setSelectedPurchases,
}) {
  const checkInSelectedPurchases = (purchase) =>
    selectedPurchases?.some((s) => s.id === purchase.id);
  return (
    <>
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
                              if (checkInSelectedPurchases(linePurchases[j])) {
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
    </>
  );
}
