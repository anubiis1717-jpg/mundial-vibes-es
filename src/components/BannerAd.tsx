import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const BANNER_AD_ID = "ca-app-pub-2559620527238538/7132720877";

let admobInitialized = false;

export const BannerAd = ({ show = true }: { show?: boolean }) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBanner = async () => {
      try {
        const { AdMob, BannerAdSize, BannerAdPosition } = await import(
          "@capacitor-community/admob"
        );
        if (!admobInitialized) {
          await AdMob.initialize({ initializeForTesting: false });
          admobInitialized = true;
        }
        if (show) {
          await AdMob.showBanner({
            adId: BANNER_AD_ID,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.TOP_CENTER,
            margin: 0,
          });
        } else {
          await AdMob.hideBanner();
        }
      } catch (e) {
        console.error("AdMob banner error:", e);
      }
    };

    handleBanner();
  }, [show]);

  return null;
};
