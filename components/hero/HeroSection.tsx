import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";

export function HeroSection({ scrollToId }: { scrollToId: (id: string) => void }) {
  return (
    <section id="hero" className="hero-section section-screen">
      <div className="hero-image-wrap">
        <Image
          className="hero-building-image"
          src="/images/building/building-day.webp"
          alt="Level 23 commercial building"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-wash" />
      </div>
      <div className="hero-panel">
        <div className="hero-level">
          <LevelMark />
        </div>
        <span className="orange-rule" />
        <p>Beyond Premium Offices</p>
        <button className="swipe-cue" type="button" onClick={() => scrollToId("explorer")}>
          <ArrowDown size={22} />
          <span>Swipe up</span>
        </button>
      </div>
    </section>
  );
}
