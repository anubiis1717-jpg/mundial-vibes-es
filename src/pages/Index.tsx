import { useState, useCallback } from "react";
import { BottomNav, Section } from "@/components/BottomNav";
import { Inicio } from "@/sections/Inicio";
import { Grupos } from "@/sections/Grupos";
import { Partidos } from "@/sections/Partidos";
import { Bracket } from "@/sections/Bracket";
import { Plantillas } from "@/sections/Plantillas";
import { Stats } from "@/sections/Stats";
import { Ajustes } from "@/sections/Ajustes";
import { BannerAd } from "@/components/BannerAd";
import { useInterstitialAd } from "@/components/InterstitialAd";
import heroBg from "@/assets/hero-bg.jpg";

const INTERSTITIAL_SECTIONS: Section[] = ["bracket", "plantillas"];

const Index = () => {
  const [section, setSection] = useState<Section>("inicio");
  const { showInterstitial } = useInterstitialAd();

  const handleSectionChange = useCallback((next: Section) => {
    if (INTERSTITIAL_SECTIONS.includes(next)) {
      showInterstitial();
    }
    setSection(next);
  }, [showInterstitial]);

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
      <BannerAd show={section === "grupos"} />
      <main className="max-w-xl mx-auto px-4 pt-6 pb-32">
        {section === "inicio" && <Inicio go={handleSectionChange} />}
        {section === "grupos" && <Grupos />}
        {section === "partidos" && <Partidos />}
        {section === "bracket" && <Bracket />}
        {section === "plantillas" && <Plantillas />}
        {section === "stats" && <Stats />}
        {section === "ajustes" && <Ajustes />}
      </main>
      <BottomNav value={section} onChange={handleSectionChange} />
    </div>
  );
};

export default Index;
