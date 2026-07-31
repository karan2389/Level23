"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";
import { useEnquiry } from "@/providers/EnquiryProvider";
import { offices as allOfficesData } from "@/data/units";

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzorQftgHcvOFIVM__WaSjufNH-oUvklM0Vj_6N2TK76whUo1I2CArZyO8jBo4x_nu3/exec";
const TYPICAL_FLOORS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export function EnquiryModal() {
  const { isOpen, closeEnquiry, mode, source, selectedFloor, selectedOffices } = useEnquiry();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  
  // General mode state
  const [localFloor, setLocalFloor] = useState<number | null>(null);
  const [localOffices, setLocalOffices] = useState<number[]>([]);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setErrorMessage("");
      if (mode === "general") {
        setLocalFloor(null);
        setLocalOffices([]);
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleToggleOffice = (officeId: number) => {
    setLocalOffices((prev) =>
      prev.includes(officeId) ? prev.filter((id) => id !== officeId) : [...prev, officeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim()) {
      return;
    }

    const floorToSubmit = mode === "floor-plan" ? selectedFloor : localFloor;
    const officesToSubmit = mode === "floor-plan" 
      ? selectedOffices.map((o) => o.id.toString()) 
      : localOffices.map((id) => id.toString());

    if (mode === "floor-plan") {
      if (!floorToSubmit) {
        setErrorMessage("Please select a floor.");
        return;
      }
      if (officesToSubmit.length === 0) {
        setErrorMessage("Please select at least one office.");
        return;
      }
    }

    setStatus("submitting");
    console.log(`[Analytics] enquiry_submitted | source: ${source} | floor: ${floorToSubmit} | offices: ${officesToSubmit.length}`);

    const officesFormatted = officesToSubmit.map((o) => (o.startsWith("Office") ? o : `Office ${o}`)).join(", ");

    const payloadFloor = floorToSubmit ? `Level ${floorToSubmit}` : "Not specified";
    const payloadOffices = officesFormatted.length > 0 ? officesFormatted : "Not specified";

    const payload = {
      name,
      email,
      mobile,
      floor: payloadFloor,
      offices: payloadOffices,
      officesArray: officesToSubmit,
      source,
      timestamp: new Date().toISOString()
    };

    const formData = new URLSearchParams();
    formData.append("gid", "0");
    formData.append("name", name);
    formData.append("email", email);
    formData.append("mobile", mobile);
    formData.append("floor", payloadFloor);
    formData.append("offices", payloadOffices);
    formData.append("source", source);
    formData.append("timestamp", payload.timestamp);

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setStatus("success");
      console.log("[Analytics] enquiry_success");
      
      setTimeout(() => {
        closeEnquiry();
      }, 2500);
    } catch (error) {
      console.error("Webhook submission error:", error);
      setStatus("error");
      setErrorMessage("Something went wrong. We couldn't submit your enquiry. Please try again.");
      console.log("[Analytics] enquiry_failed");
    }
  };

  if (status === "success") {
    return (
      <div className="modal-backdrop" role="presentation">
        <div className="modal" role="dialog" aria-modal="true">
          <span className="modal-icon"><CheckCircle size={32} /></span>
          <h2>Thank You!</h2>
          <p>Your enquiry has been submitted successfully.<br/>Our sales team will contact you shortly.</p>
          <button type="button" className="accent-button" onClick={closeEnquiry}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop enquiry-modal-backdrop" role="presentation" onClick={closeEnquiry}>
      <div className="modal enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={closeEnquiry} aria-label="Close" disabled={status === "submitting"}><X /></button>
        
        <header className="enquiry-header">
          <span className="modal-icon"><Mail /></span>
          <h2 id="enquiry-title">Enquire Now</h2>
          <p>Fill out the form below and our team will get back to you with the details.</p>
        </header>

        <form onSubmit={handleSubmit} className="enquiry-form">
          <div className="form-group">
            <label htmlFor="enquiry-name">Full Name *</label>
            <input 
              id="enquiry-name"
              type="text" 
              required 
              placeholder="John Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={status === "submitting"}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="enquiry-mobile">Mobile Number *</label>
              <input 
                id="enquiry-mobile"
                type="tel" 
                required 
                placeholder="+91 98765 43210" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                disabled={status === "submitting"}
              />
            </div>
            <div className="form-group">
              <label htmlFor="enquiry-email">Email Address</label>
              <input 
                id="enquiry-email"
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={status === "submitting"}
              />
            </div>
          </div>

          <div className="enquiry-separator" />

          {mode === "floor-plan" && (
            <div className="enquiry-readonly-section">
              <div className="readonly-row">
                <span className="readonly-label">Selected Floor</span>
                <span className="readonly-value">Level {selectedFloor}</span>
              </div>
              <div className="readonly-row">
                <span className="readonly-label">Selected Offices</span>
                <div className="readonly-offices-list">
                  {selectedOffices.map((office) => (
                    <span key={office.id} className="readonly-office-tag">
                      ✓ Office {String(office.id).padStart(2, "0")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="enquiry-error-message">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="enquiry-actions">
            {status === "error" ? (
              <button type="submit" className="accent-button">
                Retry Submission
              </button>
            ) : (
              <button type="submit" className="accent-button" disabled={status === "submitting"}>
                {status === "submitting" ? <Loader2 className="animate-spin" /> : "Submit Enquiry"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
