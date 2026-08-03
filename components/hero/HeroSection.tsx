import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection({ scrollToId }: { scrollToId: (id: string) => void }) {
  return (
    <section id="hero" className="hero-section section-screen">
      <div className="hero-image-wrap">
        <Image
          className="hero-building-image"
          src="/images/building/level23-hero-main.jpeg"
          alt="Level 23 premium commercial office building"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-wash" />
      </div>

      <div className="hero-copy">
        <h1>Beyond<br />Premium<br />Offices</h1>
        <p>Where ambition meets address. Elevate your business at Level 23.</p>
        <button className="hero-explore-button" type="button" onClick={() => scrollToId("explorer")}>
          Explore Spaces <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
