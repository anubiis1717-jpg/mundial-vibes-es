import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";

const INTERSTITIAL_AD_ID = "ca-app-pub-2559620527238538/1104019056";

export const useInterstitialAd = () => {
  const ready = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const prepare = async () => {
      try {
        const { AdMob } = await import("@capacitor-community/admob");
        await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID });
        ready.current = true;
      } catch (e) {
        console.error("Interstitial prepare error:", e);
      }
    };

    prepare();
  }, []);

  const showInterstitial = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { AdMob } = await import("@capacitor-community/admob");
      if (ready.current) {
        await AdMob.showInterstitial();
        ready.current = false;
        // Prepara el siguiente inmediatamente
        setTimeout(async () => {
          await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID });
          ready.current = true;
        }, 3000);
      }
    } catch (e) {
      console.error("Interstitial show error:", e);
    }
  };

  return { showInterstitial };
};
