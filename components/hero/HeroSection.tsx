import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";
import { ScrollIndicator, useScrollIndicatorVisible } from "@/components/common/ScrollIndicator";

export function HeroSection({ scrollToId }: { scrollToId: (id: string) => void }) {
  const indicatorVisible = useScrollIndicatorVisible("hero");

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

      <ScrollIndicator
        nextSectionId="explorer"
        label="Scroll Down"
        subLabel="Scroll to Explore"
        visible={indicatorVisible}
      />
    </section>
  );
}
