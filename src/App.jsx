import { useEffect } from "react";
import Backdrop from "@/components/layout/Backdrop";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import ScrollHint from "@/components/landing/ScrollHint";
import Marquee from "@/components/landing/Marquee";
import ProblemSection from "@/components/landing/ProblemSection";
import ExperiencesSection from "@/components/landing/ExperiencesSection";
import SimulatorSection from "@/components/landing/SimulatorSection";
import VenueSection from "@/components/landing/VenueSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import TrustSection from "@/components/landing/TrustSection";
import AppView from "@/components/app/AppView";
import SiteFooter from "@/components/layout/SiteFooter";
import Modals from "@/components/modals";
import SectionMenuButton from "@/components/ui/SectionMenuButton";
import StorageBanner from "@/components/privacy/StorageBanner";
import ToastHost from "@/components/ui/ToastHost";
import { bootKnet } from "@/lib/boot";

/**
 * KNET · Knowledge Network & Event Technology
 * La landing y el panel se renderizan una sola vez con React; después el motor de KNET
 * (src/lib) toma el DOM para las animaciones, el panel, el 3D y la traducción.
 */
export default function App() {
  useEffect(() => {
    bootKnet();
  }, []);

  return (
    <>
      <Backdrop />
      <Navbar />
      <main id="top">
        <Hero />
        <ScrollHint />
        <Marquee />
        <ProblemSection />
        <ExperiencesSection />
        <SimulatorSection />
        <VenueSection />
        <ArchitectureSection />
        <TrustSection />
      </main>
      <AppView />
      <SiteFooter />
      <Modals />
      <SectionMenuButton />
      <StorageBanner />
      <ToastHost />
    </>
  );
}
