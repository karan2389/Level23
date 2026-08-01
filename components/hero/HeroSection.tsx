import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";

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
        <div className="hero-copy-logo">
          <LevelMark />
        </div>
        <h1>Beyond<br />Premium<br />Offices</h1>
        <p>Where ambition meets address. Elevate your business at Level 23.</p>
        <button className="hero-explore-button" type="button" onClick={() => scrollToId("explorer")}>
          Explore Spaces <ArrowRight size={20} />
        </button>
      </div>

      <button className="hero-swipe-cue" type="button" onClick={() => scrollToId("explorer")}>
        <span className="hero-swipe-icon"><ArrowDown size={24} /></span>
        <strong>Swipe up</strong>
        <small>Scroll to explore</small>
      </button>
    </section>
  );
}
