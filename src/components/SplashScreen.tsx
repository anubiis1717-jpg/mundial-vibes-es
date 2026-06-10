import { useEffect, useState } from "react";

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const finishTimer = setTimeout(() => onFinish(), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span
            className="text-6xl font-black tracking-wider"
            style={{
              background: "linear-gradient(135deg, #f5c518 0%, #e8a000 50%, #f5c518 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              fontFamily: "sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            FUT<span style={{ WebkitTextFillColor: "#ffffff" }}>H</span>ORA
          </span>
        </div>
        <p
          className="text-sm tracking-widest uppercase"
          style={{ color: "#f5c518", letterSpacing: "0.3em" }}
        >
          Hora de Fútbol
        </p>
        <div className="mt-6">
          <div
            className="w-8 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: "#f5c518" }}
          />
        </div>
      </div>
    </div>
  );
};
