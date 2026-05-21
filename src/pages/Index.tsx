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
            "radial-gradient(70% 50% at 50% 40%, transparent 0%, hsl(224 45% 4% / 0.25) 60%, hsl(224 45% 4% / 0.55) 100%), linear-gradient(180deg, hsl(224 45% 4% / 0.35) 0%, hsl(224 45% 4% / 0.55) 100%)",
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
