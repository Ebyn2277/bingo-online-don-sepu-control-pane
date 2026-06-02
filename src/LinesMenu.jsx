import { useState } from "react";
import html2canvas from "html2canvas";
import "./LinesMenu.css";

export function LinesMenu({ linesRef, selectIndividual, setSelectIndividual }) {
  const [screenshotURL, setScreenshotURL] = useState(null);
  const [isShrinked, setIsShrinked] = useState(false);

  const onClickShrinkLines = () => {
    setIsShrinked((prev) => !prev);
    linesRef.current?.classList.toggle("shrinked");
  };

  const scrollToLines = () => {
    linesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
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

  // NUEVO: Cambia el estado al hacer clic en la opción del menú
  const onClickToggleSelectionMode = () => {
    setSelectIndividual((prev) => !prev);
  };

  return (
    <>
      <ul className="lines-menu">
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
        <li>
          <button className="center-lines-button" onClick={scrollToLines}>
            Centrar
          </button>
        </li>
        <li>
          <button onClick={onClickShrinkLines}>
            {isShrinked ? "Restaurar tamaño" : "Reducir tamaño"}
          </button>
        </li>
        {/* NUEVA OPCIÓN DENTRO DEL MENÚ */}
        <li>
          <button
            type="button"
            onClick={onClickToggleSelectionMode}
            className={selectIndividual ? "mode-individual-active" : ""}
          >
            {selectIndividual
              ? "Seleccionar uno por uno"
              : "Seleccionar todo el usuario"}
          </button>
        </li>
      </ul>
    </>
  );
}
