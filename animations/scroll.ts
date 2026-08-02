import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PARALLAX_CONFIG } from "@/utils/scrollConfig";
import {
  revealFrom,
  revealStaggered,
  imageScaleReveal,
  parallaxElement,
} from "@/utils/animationPresets";

export function initScrollAnimations(rootElement: React.RefObject<HTMLElement | null>) {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    // ── Initial Load Sequence ──────────────────────────────────────────
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".site-header", { opacity: 0, y: -20, duration: 0.75 })
      .from(".hero-building-image", { opacity: 0, scale: 1.1, duration: 1.35 }, "-=0.4")
      .from(".hero-copy > *", { opacity: 0, y: 26, stagger: 0.11, duration: 0.7 }, "-=0.65");

    // ── Parallax Elements ─────────────────────────────────────────────
    parallaxElement(".hero-building-image", "#hero", PARALLAX_CONFIG.heroBg);
    parallaxElement(".hero-wash", "#hero", PARALLAX_CONFIG.heroWash);
    parallaxElement(".explorer-section", "#explorer", 0.05);
    parallaxElement(".interior-image img", "#interiors", PARALLAX_CONFIG.interiorBg);
    parallaxElement(".map-card", "#location", PARALLAX_CONFIG.mapCard);

    // Hero content fades out nicely on scroll
    gsap.to(".hero-copy", {
      opacity: 0,
      y: -85,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "55% top", end: "bottom top", scrub: true },
    });

    // ── Staggered Reveals per Section ──────────────────────────────────
    
    // Building Explorer
    revealStaggered("#explorer", ".section-title > *");
    revealStaggered("#explorer", ".floor-selector > *", { y: 20, stagger: 0.05 });
    
    // Floor Plans
    revealStaggered("#floor-plan", ".section-title > *");
    imageScaleReveal(".plan-viewport", "#floor-plan");
    
    // Interiors
    revealStaggered("#interiors", ".section-title > *");
    revealFrom(".interior-slider", { trigger: "#interiors", delay: 0.2 });
    
    // Location
    revealStaggered("#location", ".section-title > *");
    revealFrom(".map-card", { trigger: "#location", delay: 0.1 });
    revealStaggered("#location", ".address-card, .project-features > article, .connect-block > *", { y: 30 });
    revealFrom(".project-footer", { trigger: ".project-footer", start: "top 95%" });

    // ── Generic Reveal Classes ─────────────────────────────────────────
    // For anything that still uses the .reveal class fallback
    gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
      // Only animate if not already part of a staggered reveal to avoid conflicts
      if (!element.closest(".section-title") && !element.classList.contains("map-card") && !element.classList.contains("address-card") && !element.classList.contains("connect-block")) {
        revealFrom(element);
      }
    });

    // ── Cinematic Blur-in per section ──────────────────────────────────
    gsap.utils.toArray<HTMLElement>(".section-screen").forEach((section) => {
      // Don't blur hero since it's already visible
      if (section.id === "hero") return;
      
      gsap.fromTo(
        section,
        { filter: "blur(8px)", opacity: 0.45 },
        {
          filter: "blur(0px)",
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 96%", end: "top 55%", scrub: true },
        }
      );
    });

  }, rootElement);

  return ctx;
}
