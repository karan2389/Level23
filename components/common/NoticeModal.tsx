import { Info, X } from "lucide-react";

export function NoticeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pending-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        <span className="modal-icon"><Info /></span>
        <h2 id="pending-title">Information to be added</h2>
        <p>The builder’s confirmed phone number, email, WhatsApp link, live availability and cost sheet can be connected here later.</p>
        <button type="button" className="accent-button" onClick={onClose}>Understood</button>
      </div>
    </div>
  );
}
