import Image from "next/image";
import { Menu } from "lucide-react";

export function Header({ onMenu, scrollToId }: { onMenu: () => void; scrollToId: (id: string) => void }) {
  return (
    <header className="site-header">
      <button className="brand-wordmark" type="button" onClick={() => scrollToId("hero")} aria-label="Return to home">
        <Image src="/images/logos/akshar.png" alt="Akshar - Inspire Life" height={206} width={329} className="brand-logo brand-logo-akshar" priority />
        <i aria-hidden="true" />
        <Image src="/images/logos/bhagwati.png" alt="Bhagwati - Innovation in Realty" height={637} width={964} className="brand-logo brand-logo-bhagwati" priority />
      </button>

      <button className="header-level-brand" type="button" onClick={() => scrollToId("hero")} aria-label="Level 23 home">
        <Image src="/images/logos/level23.png" alt="Level 23 - Premium Office Spaces" height={381} width={1533} priority />
      </button>

      <button type="button" className="menu-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={31} strokeWidth={1.25} />
      </button>
    </header>
  );
}
