"use client";

import { useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronDown, X, Layers, Check } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";
import PanZoomViewport from "@/components/PanZoomViewport";
import { floorGroups } from "@/data/floors";
import { offices } from "@/data/units";
import type { FloorGroupId } from "@/types/floor";
import type { Office } from "@/types/unit";

export function PlanViewer({
  activePlan,
  setActivePlan,
  scrollToId,
  selectedOffice,
  setSelectedOffice,
  setOfficePopupOpen,
  multiSelectMode,
  multiSelectedOffices,
  onToggleOffice,
  onCancelMultiSelect,
  onDoneMultiSelect,
}: {
  activePlan: FloorGroupId;
  setActivePlan: (floor: FloorGroupId) => void;
  scrollToId: (id: string) => void;
  selectedOffice: Office;
  setSelectedOffice: (office: Office) => void;
  setOfficePopupOpen: (open: boolean) => void;
  multiSelectMode: boolean;
  multiSelectedOffices: Office[];
  onToggleOffice: (office: Office) => void;
  onCancelMultiSelect: () => void;
  onDoneMultiSelect: () => void;
}) {
  const activePlanData = useMemo(
    () => floorGroups.find((floor) => floor.id === activePlan) ?? floorGroups[4],
    [activePlan]
  );

  const isMultiSelected = (office: Office) =>
    multiSelectedOffices.some((o) => o.id === office.id);

  return (
    <section id="floor-plan" className="plan-section section-screen">
      <div className="section-inner plan-inner">
        <LevelMark />
        <div className="plan-heading reveal">
          <button type="button" onClick={() => scrollToId("explorer")} aria-label="Back to building explorer"><ArrowLeft /></button>
          <h2>Floor Plan</h2>
          <label>
            <span className="sr-only">Select floor plan</span>
            <select
              value={activePlan}
              onChange={(event) => setActivePlan(event.target.value as FloorGroupId)}
            >
              {floorGroups.map((floor) => <option key={floor.id} value={floor.id}>{floor.short} {floor.label}</option>)}
            </select>
            <ChevronDown size={17} />
          </label>
        </div>

        {/* Instruction banner — shown in multi-select mode */}
        {multiSelectMode && activePlan === "offices" && (
          <div className="multi-select-banner" role="status">
            <Layers size={18} aria-hidden="true" />
            <span>Tap office blocks to select or remove them. Press &ldquo;Done&rdquo; when your selection is complete.</span>
            <button
              type="button"
              className="multi-select-banner-close"
              onClick={onCancelMultiSelect}
              aria-label="Cancel multi-selection"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className={`floor-plan-card reveal ${activePlan === "offices" ? "typical-active" : ""}`}>
          {activePlan === "offices" ? (
            <PanZoomViewport key="offices" className="typical-plan-panzoom" ariaLabel="Typical office floor plan. Drag to pan and pinch to zoom.">
              <div className="interactive-plan-canvas">
                <Image src="/images/plans/typical-plan.webp" alt="Typical floors 7 to 22 plan" fill sizes="1600px" priority={false} />
                {offices.map((office) => {
                  const isSelected = multiSelectMode
                    ? isMultiSelected(office)
                    : office.id === selectedOffice.id;

                  return (
                    <button
                      key={office.id}
                      type="button"
                      className={`office-hotspot${isSelected ? (multiSelectMode ? " multi-selected" : " selected") : ""}`}
                      style={{ left: `${office.x}%`, top: `${office.y}%`, width: `${office.w}%`, height: `${office.h}%` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (multiSelectMode) {
                          onToggleOffice(office);
                        } else {
                          setSelectedOffice(office);
                          setOfficePopupOpen(true);
                        }
                      }}
                      aria-label={
                        multiSelectMode
                          ? `${isSelected ? "Deselect" : "Select"} Office ${String(office.id).padStart(2, "0")}`
                          : `Open details for Office ${String(office.id).padStart(2, "0")}`
                      }
                      aria-pressed={multiSelectMode ? isSelected : undefined}
                    >
                      {multiSelectMode && isSelected ? (
                        <span className="office-hotspot-check"><Check size={14} /></span>
                      ) : (
                        <span>{String(office.id).padStart(2, "0")}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </PanZoomViewport>
          ) : (
            <PanZoomViewport key={activePlan} className="standard-plan-panzoom" ariaLabel={`${activePlanData.title} plan. Drag to pan and pinch to zoom.`}>
              <div className="standard-interactive-plan-canvas" style={{ aspectRatio: activePlan === "amenities" ? "1514 / 900" : activePlan === "premium" ? "1599 / 880" : "1600 / 886" }}>
                <Image src={activePlanData.plan} alt={`${activePlanData.title} plan`} fill sizes="1600px" />
              </div>
            </PanZoomViewport>
          )}
          {/* Relocated action bar directly beneath the floor plan viewport, inside the card */}
          {multiSelectMode && activePlan === "offices" && (
            <div className="multi-select-toolbar-relocated" role="toolbar" aria-label="Multi-office selection controls">
              <div className="multi-select-toolbar-count">
                <Layers size={20} aria-hidden="true" />
                <span>
                  <strong>{multiSelectedOffices.length}</strong>{" "}
                  {multiSelectedOffices.length === 1 ? "Office" : "Offices"} Selected
                </span>
              </div>
              <div className="multi-select-toolbar-actions">
                <button
                  type="button"
                  className="multi-select-cancel-btn"
                  onClick={onCancelMultiSelect}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="multi-select-done-btn"
                  onClick={onDoneMultiSelect}
                  disabled={multiSelectedOffices.length === 0}
                >
                  Done – Show selected
                </button>
              </div>
            </div>
          )}

          <div className="plan-legend">
            <span><i className="office-color" /> Office</span>
            <span><i className="core-color" /> Service / Core</span>
            <span><i className="refuge-color" /> Refuge / Open area</span>
          </div>
        </div>

        {activePlan === "offices" ? (
          !multiSelectMode && (
            <div className="plan-information reveal office-tap-instruction">
              <Layers size={19} />
              <span>Pinch to zoom, drag to pan, then tap any office block to open its details.</span>
            </div>
          )
        ) : (
          <div className="plan-information reveal">
            <Layers size={19} />
            <span>{activePlanData.description} Individual unit interaction is enabled for the typical office floors in this demo.</span>
          </div>
        )}
      </div>
    </section>
  );
}
