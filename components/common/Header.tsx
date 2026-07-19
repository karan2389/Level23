import { Flower2, Menu } from "lucide-react";

export function Header({ onMenu, scrollToId }: { onMenu: () => void; scrollToId: (id: string) => void }) {
  return (
    <header className="site-header">
      <button className="brand-wordmark" type="button" onClick={() => scrollToId("hero")} aria-label="Return to home">
        <span>Akshar</span>
        <i />
        <Flower2 size={27} strokeWidth={1.15} />
        <span>Bhagwati</span>
      </button>
      <button type="button" className="menu-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={31} strokeWidth={1.25} />
      </button>
    </header>
  );
}
