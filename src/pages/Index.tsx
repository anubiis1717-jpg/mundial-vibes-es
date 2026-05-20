import { useState } from "react";
import { BottomNav, Section } from "@/components/BottomNav";
import { Inicio } from "@/sections/Inicio";
import { Grupos } from "@/sections/Grupos";
import { Partidos } from "@/sections/Partidos";
import { Bracket } from "@/sections/Bracket";
import { Stats } from "@/sections/Stats";
import { Ajustes } from "@/sections/Ajustes";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const [section, setSection] = useState<Section>("inicio");

  return (
    <div className="min-h-screen text-foreground relative">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 10%, hsl(0 92% 55% / 0.18), transparent 70%), radial-gradient(55% 45% at 85% 20%, hsl(215 100% 60% / 0.18), transparent 70%), radial-gradient(70% 60% at 50% 100%, hsl(142 80% 45% / 0.16), transparent 70%), linear-gradient(180deg, hsl(224 45% 4% / 0.55) 0%, hsl(224 45% 4% / 0.78) 100%)",
        }}
        aria-hidden
      />
      <main className="max-w-xl mx-auto px-4 pt-6 pb-32">
        {section === "inicio" && <Inicio go={setSection} />}
        {section === "grupos" && <Grupos />}
        {section === "partidos" && <Partidos />}
        {section === "bracket" && <Bracket />}
        {section === "stats" && <Stats />}
        {section === "ajustes" && <Ajustes />}
      </main>
      <BottomNav value={section} onChange={setSection} />
    </div>
  );
};

export default Index;
