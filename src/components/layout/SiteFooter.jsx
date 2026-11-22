import ClosingCta from "@/components/landing/ClosingCta";
import FooterBar from "@/components/layout/FooterBar";
import FooterLinks from "@/components/layout/FooterLinks";
import Motto from "@/components/team/Motto";
import TeamSection from "@/components/team/TeamSection";

/**
 * Footer: CTA de cierre, equipo, lema, enlaces (producto, legal, contacto) y barra final.
 */
export default function SiteFooter() {
  return (
    <footer className="band" style={{ paddingBottom: "40px" }}>
      <div className="wrap">
        <ClosingCta />
        {/* Equipo KNET: 3 integrantes + cápsula del Reto 03 = grid 2×2 sin huecos */}
        <TeamSection />
        {/* Lema del proyecto */}
        <Motto />
        <FooterLinks />
        <FooterBar />
      </div>
    </footer>
  );
}
