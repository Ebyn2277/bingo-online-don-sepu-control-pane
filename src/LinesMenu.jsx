import { useState } from "react";
import html2canvas from "html2canvas";
import "./LinesMenu.css";

export function LinesMenu({ linesRef }) {
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

  return (
    <>
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
    </>
  );
}
