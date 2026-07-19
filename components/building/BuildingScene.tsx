import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Rotate3D } from "lucide-react";
import { LevelMark } from "@/components/common/LevelMark";
import { floorGroups } from "@/data/floors";
import type { FloorGroupId } from "@/types/floor";

const BuildingModel = dynamic(() => import("@/components/BuildingModel"), {
  ssr: false,
  loading: () => <div className="model-loading">Preparing the interactive building…</div>,
});

export function BuildingScene({ 
  selectedFloor, 
  setSelectedFloor, 
  openPlan 
}: { 
  selectedFloor: FloorGroupId;
  setSelectedFloor: (floor: FloorGroupId) => void;
  openPlan: () => void;
}) {
  const [modelNudge, setModelNudge] = useState(0);

  const selectedFloorData = useMemo(
    () => floorGroups.find((floor) => floor.id === selectedFloor) ?? floorGroups[4],
    [selectedFloor]
  );

  return (
    <section id="explorer" className="explorer-section section-screen">
      <div className="section-inner explorer-inner">
        <LevelMark />
        <div className="section-title reveal">
          <h2>3D Building Explorer</h2>
          <p>Explore every level. Visualize your view.</p>
        </div>

        <div className="model-stage reveal">
          <button className="model-arrow left" type="button" onClick={() => setModelNudge((value) => value - 1)} aria-label="Rotate building left">
            <ArrowLeft />
          </button>
          <div className="model-canvas">
            <BuildingModel selected={selectedFloor} nudge={modelNudge} />
            <div className="model-hint"><Rotate3D size={17} /> Drag to rotate · pinch to zoom</div>
          </div>
          <button className="model-arrow right" type="button" onClick={() => setModelNudge((value) => value + 1)} aria-label="Rotate building right">
            <ArrowRight />
          </button>
        </div>

        <div className="floor-picker reveal">
          <span>Select Floor Range</span>
          <div className="floor-pills">
            {floorGroups.map((floor) => (
              <button
                key={floor.id}
                type="button"
                className={floor.id === selectedFloor ? "active" : ""}
                onClick={() => setSelectedFloor(floor.id)}
              >
                <strong>{floor.short}</strong>
                <small>{floor.label}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="selected-floor-card reveal">
          <div>
            <small>{selectedFloorData.short}</small>
            <h3>{selectedFloorData.title}</h3>
            <p>{selectedFloorData.description}</p>
          </div>
          <button className="accent-button" type="button" onClick={openPlan}>
            View Floor Plan <ArrowRight size={23} />
          </button>
        </div>
      </div>
    </section>
  );
}
