import { MapPin, ExternalLink, ShoppingBag, Building2, Trees, Phone, Mail, CalendarDays, ArrowRight } from "lucide-react";
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
          <div><small>Sales Office</small><strong>Next to Abbott Hotel, Sector 2,<br />Vashi, Navi Mumbai – 400703</strong></div>
        </div>

        <div className="project-features reveal">
          <article><ShoppingBag /><strong>Retail Podium</strong><span>Ground floor</span></article>
          <article><Building2 /><strong>Typical Offices</strong><span>Levels 7–22</span></article>
          <article><Trees /><strong>Premium Terraces</strong><span>Level 23</span></article>
        </div>

        <div className="connect-block reveal">
          <span>Let’s Connect</span>
          <h2>Speak to our experts.</h2>
          <div className="pending-contact-row">
            <button type="button" onClick={onNotice}><Phone /> Contact number to be added</button>
            <button type="button" onClick={onNotice}><Mail /> Email to be added</button>
          </div>
          <button className="accent-button schedule-button" type="button" onClick={onNotice}><CalendarDays /> Schedule Site Visit <ArrowRight /></button>
        </div>

        <div className="footer-mark"><span className="tower-glyph"><i /><i /><i /></span><strong>LEVEL23 · BEYOND PREMIUM OFFICES.</strong></div>
      </div>
    </section>
  );
}
