import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Building2,
  Compass,
  Layers,
  Sparkles,
  MapPin,
  Phone,
  ArrowRight,
  X
} from "lucide-react";

export function NavigationMenu({
  onClose,
  scrollToId
}: {
  onClose: () => void;
  scrollToId: (id: string) => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleNav = (id: string) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      scrollToId(id);
    }, 200);
  };

  const navItems = [
    { id: "hero", label: "Home", icon: Building2 },
    { id: "explorer", label: "3D Building Explorer", icon: Compass },
    { id: "floor-plan", label: "Floor Plans", icon: Layers },
    { id: "interiors", label: "Workspace Ideas", icon: Sparkles },
    { id: "location", label: "Location", icon: MapPin },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <div
      className={`nav-backdrop ${isClosing ? "nav-backdrop-leaving" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <div
        className={`nav-panel ${isClosing ? "nav-panel-leaving" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nav-panel-header">
          <div className="nav-panel-brand nav-panel-brand-image">
            <Image src="/images/logos/level23.png" alt="Level 23 - Premium Office Spaces" width={1533} height={381} />
          </div>
          <button
            className="nav-glass-close"
            type="button"
            onClick={handleClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="nav-menu-list">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="nav-menu-item"
                onClick={() => handleNav(item.id)}
              >
                <div className="nav-item-icon-wrap">
                  <Icon size={19} />
                </div>
                <div className="nav-item-content">
                  <span className="nav-item-num">0{index + 1}</span>
                  <span className="nav-item-title">{item.label}</span>
                </div>
                <ArrowRight size={17} className="nav-item-arrow" />
              </button>
            );
          })}
        </nav>

        <div className="nav-panel-footer">
          <span>AKSHAR &amp; BHAGWATI GROUP</span>
        </div>
      </div>
    </div>
  );
}
