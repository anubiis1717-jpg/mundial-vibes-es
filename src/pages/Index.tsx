import { useState } from "react";
import { BottomNav, Section } from "@/components/BottomNav";
import { Inicio } from "@/sections/Inicio";
import { Grupos } from "@/sections/Grupos";
import { Partidos } from "@/sections/Partidos";
import { Bracket } from "@/sections/Bracket";
import { Stats } from "@/sections/Stats";
import { Ajustes } from "@/sections/Ajustes";

const Index = () => {
  const [section, setSection] = useState<Section>("inicio");

  return (
    <div className="min-h-screen text-foreground">
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
