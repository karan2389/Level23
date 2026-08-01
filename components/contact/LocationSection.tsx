import Image from "next/image";
import {
  MapPin,
  ExternalLink,
  ShoppingBag,
  Building2,
  Trees,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";

export function LocationSection({ onNotice }: { onNotice: () => void }) {
  return (
    <section id="location" className="location-section section-screen">
      <div className="section-inner location-inner">
        <LevelMark />
        <div className="section-title reveal">
          <h2>Right Place. Better Business.</h2>
          <p>Strategically connected. Effortlessly accessible.</p>
        </div>

        <div className="map-card reveal">
          <iframe
            title="Level 23 sales office location"
            src="https://www.google.com/maps?q=Abbott%20Hotel%20Sector%202%20Vashi%20Navi%20Mumbai&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a href="https://www.google.com/maps/search/?api=1&query=Abbott+Hotel+Sector+2+Vashi+Navi+Mumbai" target="_blank" rel="noreferrer"><MapPin /> Open in Google Maps <ExternalLink size={16} /></a>
        </div>

        <div className="address-card reveal">
          <span><MapPin /></span>
          <div>
            <small>Sales Office Address</small>
            <strong>Next to Abbott Hotel, Plot No. 22, 23, 32 &amp; 33, Sector - 2, Vashi,<br />Navi Mumbai - 400 703</strong>
          </div>
        </div>

        <div className="project-features reveal">
          <article><ShoppingBag /><strong>Retail Podium</strong><span>Ground floor</span></article>
          <article><Building2 /><strong>Typical Offices</strong><span>Levels 7-22</span></article>
          <article><Trees /><strong>Premium Terraces</strong><span>Level 23</span></article>
        </div>

        <div className="connect-block reveal">
          <span>Let&apos;s Connect</span>
          <h2>Speak to our experts.</h2>
          <div className="pending-contact-row">
            <a href="tel:+917353031888" className="contact-link"><Phone /> +91 73530 31888</a>
            <a href="mailto:info@level23.co.in" className="contact-link"><Mail /> info@level23.co.in</a>
            <a href="https://www.level23.co.in" target="_blank" rel="noreferrer" className="contact-link"><Globe2 /> www.level23.co.in</a>
          </div>
          <button className="accent-button schedule-button" type="button" onClick={onNotice}><CalendarDays /> Schedule Site Visit <ArrowRight /></button>
        </div>

        <footer className="project-footer reveal">
          <div className="project-footer-branding">
            <div className="project-footer-logo-card">
              <Image src="/images/logos/akshar-footer-original.png" alt="Akshar - Inspire Life" width={360} height={238} />
            </div>
            <span className="project-footer-divider" aria-hidden="true" />
            <div className="project-footer-logo-card project-footer-logo-card-bhagwati">
              <Image src="/images/logos/bhagwati-footer-original.png" alt="Bhagwati - Innovation in Realty" width={996} height={669} />
            </div>
          </div>

          <div className="project-footer-details">
            <div className="project-footer-address">
              <span>Sales Office Address:</span>
              <strong>Next to Abbott Hotel, Plot No. 22, 23, 32 &amp; 33, Sector - 2, Vashi,<br />Navi Mumbai - 400 703</strong>
            </div>

            <div className="project-footer-links">
              <a href="tel:+917353031888"><Phone size={17} /> 73530 31888</a>
              <a href="mailto:info@level23.co.in"><Mail size={17} /> info@level23.co.in</a>
              <a href="https://www.level23.co.in" target="_blank" rel="noreferrer"><Globe2 size={17} /> www.level23.co.in</a>
            </div>
          </div>

          <div className="project-footer-legal">
            <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noreferrer">
              <ShieldCheck size={18} /> MahaRERA Reg. No.: P51700053764
            </a>
            <p><strong>Disclaimer:</strong> All specifications, drawing, amenities, facilities, parameters, etc., shown in this brochure are subject to change as per the approval from the respective authorities. The final discretion remains with the developers.</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
