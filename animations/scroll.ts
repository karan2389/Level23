import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initScrollAnimations(rootElement: React.RefObject<HTMLElement | null>) {
  gsap.registerPlugin(ScrollTrigger);
  
  const ctx = gsap.context(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".site-header", { opacity: 0, y: -20, duration: 0.75 })
      .from(".hero-level", { opacity: 0, y: -12, duration: 0.65 }, "-=0.35")
      .from(".hero-building-image", { opacity: 0, scale: 1.1, duration: 1.35 }, "-=0.4")
      .from(".hero-panel > *", { opacity: 0, y: 26, stagger: 0.11, duration: 0.7 }, "-=0.65");

    gsap.to(".hero-building-image", {
      scale: 1.14,
      yPercent: -4,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });
    
    gsap.to(".hero-panel", {
      opacity: 0,
      y: -85,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "55% top", end: "bottom top", scrub: true },
    });

    gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 40,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 84%", toggleActions: "play none none reverse" },
      });
    });

    gsap.utils.toArray<HTMLElement>(".section-screen").forEach((section) => {
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
