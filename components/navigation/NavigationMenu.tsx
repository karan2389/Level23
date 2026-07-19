import { ArrowRight, X } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";

export function NavigationMenu({ onClose, scrollToId }: { onClose: () => void; scrollToId: (id: string) => void }) {
  const handleNav = (id: string) => {
    onClose();
    window.setTimeout(() => scrollToId(id), 80);
  };

  return (
    <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Site navigation">
      <button className="menu-close" type="button" onClick={onClose} aria-label="Close navigation"><X /></button>
      <LevelMark />
      <nav>
        {[
          ["hero", "Home"],
          ["explorer", "3D Building Explorer"],
          ["floor-plan", "Floor Plans"],
          ["interiors", "Workspace Ideas"],
          ["location", "Location & Contact"],
        ].map(([id, label], index) => (
          <button key={id} type="button" onClick={() => handleNav(id)}>
            <span>0{index + 1}</span>{label}<ArrowRight />
          </button>
        ))}
      </nav>
    </div>
  );
}
