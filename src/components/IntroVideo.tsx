import { useEffect, useRef, useState } from "react";

export const IntroVideo = () => {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem("introPlayed") !== "1"
  );
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const dismiss = () => {
    sessionStorage.setItem("introPlayed", "1");
    setFading(true);
    setTimeout(() => setVisible(false), 500);
  };

  useEffect(() => {
    if (!visible) return;
    const video = videoRef.current;
    if (!video) return;
    // Si el video no logra arrancar en 2s, saltamos la intro para no bloquear la app
    const safety = setTimeout(() => {
      if (video.currentTime === 0) dismiss();
    }, 2000);
    video.play().catch(() => dismiss());
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={dismiss}
        className="h-full w-full object-cover"
      />
    </div>
  );
};
