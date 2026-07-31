import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";
import { interiors } from "@/data/interiors";

export function InteriorsSection() {
  const [galleryIndex, setGalleryIndex] = useState(0);

  return (
    <section id="interiors" className="interiors-page section-screen">
      <div className="section-inner">
        <LevelMark />
        <div className="interiors-section reveal">
          <div className="section-title compact">
            <span>Indicative Workspace</span>
            <h2>Visualize your office</h2>
            <p>Illustrative fit-out ideas using the supplied interior layouts.</p>
          </div>
          <div className="interior-slider">
            <button type="button" onClick={() => setGalleryIndex((index) => (index - 1 + interiors.length) % interiors.length)} aria-label="Previous interior"><ArrowLeft /></button>
            <div className="interior-image"><Image src={interiors[galleryIndex]} alt={`Indicative office layout ${galleryIndex + 1}`} fill sizes="900px" /></div>
            <button type="button" onClick={() => setGalleryIndex((index) => (index + 1) % interiors.length)} aria-label="Next interior"><ArrowRight /></button>
          </div>
          <div className="slider-dots">{interiors.map((_, index) => <button key={index} type="button" className={index === galleryIndex ? "active" : ""} onClick={() => setGalleryIndex(index)} aria-label={`Show interior ${index + 1}`} />)}</div>
        </div>
      </div>
    </section>
  );
}
