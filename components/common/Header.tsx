import Image from "next/image";
import { Menu } from "lucide-react";

export function Header({ onMenu, scrollToId }: { onMenu: () => void; scrollToId: (id: string) => void }) {
  return (
    <header className="site-header">
      <button className="brand-wordmark" type="button" onClick={() => scrollToId("hero")} aria-label="Return to home">
        <Image src="/images/logos/akshar.png" alt="Akshar" height={38} width={120} className="brand-logo brand-logo-akshar" />
        <i />
        <Image src="/images/logos/bhagwati.png" alt="Bhagwati" height={38} width={140} className="brand-logo brand-logo-bhagwati" />
      </button>
      <button type="button" className="menu-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={31} strokeWidth={1.25} />
      </button>
    </header>
  );
}
