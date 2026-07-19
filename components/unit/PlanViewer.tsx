import { useMemo } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
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
  setOfficePopupOpen
}: {
  activePlan: FloorGroupId;
  setActivePlan: (floor: FloorGroupId) => void;
  scrollToId: (id: string) => void;
  selectedOffice: Office;
  setSelectedOffice: (office: Office) => void;
  setOfficePopupOpen: (open: boolean) => void;
}) {
  const activePlanData = useMemo(
    () => floorGroups.find((floor) => floor.id === activePlan) ?? floorGroups[4],
    [activePlan]
  );

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

        <div className={`floor-plan-card reveal ${activePlan === "offices" ? "typical-active" : ""}`}>
          {activePlan === "offices" ? (
            <PanZoomViewport key="offices" className="typical-plan-panzoom" ariaLabel="Typical office floor plan. Drag to pan and pinch to zoom.">
              <div className="interactive-plan-canvas">
                <Image src="/images/plans/typical-plan.webp" alt="Typical floors 7 to 22 plan" fill sizes="1600px" priority={false} />
                {offices.map((office) => (
                  <button
                    key={office.id}
                    type="button"
                    className={`office-hotspot ${office.id === selectedOffice.id ? "selected" : ""}`}
                    style={{ left: `${office.x}%`, top: `${office.y}%`, width: `${office.w}%`, height: `${office.h}%` }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedOffice(office);
                      setOfficePopupOpen(true);
                    }}
                    aria-label={`Open details for Office ${String(office.id).padStart(2, "0")}`}
                  >
                    <span>{String(office.id).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </PanZoomViewport>
          ) : (
            <PanZoomViewport key={activePlan} className="standard-plan-panzoom" ariaLabel={`${activePlanData.title} plan. Drag to pan and pinch to zoom.`}>
              <div className="standard-interactive-plan-canvas" style={{ aspectRatio: activePlan === "amenities" ? "1514 / 900" : activePlan === "premium" ? "1599 / 880" : "1600 / 886" }}>
                <Image src={activePlanData.plan} alt={`${activePlanData.title} plan`} fill sizes="1600px" />
              </div>
            </PanZoomViewport>
          )}

          <div className="plan-legend">
            <span><i className="office-color" /> Office</span>
            <span><i className="core-color" /> Service / Core</span>
            <span><i className="refuge-color" /> Refuge / Open area</span>
          </div>
        </div>

        {activePlan === "offices" ? (
          <div className="plan-information reveal office-tap-instruction">
            <Info size={19} />
            <span>Pinch to zoom, drag to pan, then tap any office block to open its image and details.</span>
          </div>
        ) : (
          <div className="plan-information reveal">
            <Info size={19} />
            <span>{activePlanData.description} Individual unit interaction is enabled for the typical office floors in this demo.</span>
          </div>
        )}
      </div>
    </section>
  );
}
