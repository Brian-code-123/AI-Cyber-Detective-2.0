import { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext.jsx";

export default function MatrixBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ∑∞Ψ∂";
    const fontSize = 12;
    let cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);

    const color = theme === "dark"
      ? "rgba(10, 132, 255, 0.12)"
      : "rgba(0, 113, 227, 0.06)";
    const glowColor = theme === "dark" ? "#0A84FF" : "#0071E3";
    const bgAlpha = theme === "dark" ? "rgba(0,0,0,0.04)" : "rgba(248,248,250,0.06)";

    let frame;
    const draw = () => {
      ctx.fillStyle = bgAlpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px 'SF Mono','Fira Code',monospace`;

      cols = Math.floor(canvas.width / fontSize);
      while (drops.length < cols) drops.push(1);

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        if (drops[i] * fontSize < 5) {
          ctx.fillStyle = glowColor;
        } else {
          ctx.fillStyle = color;
        }
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
