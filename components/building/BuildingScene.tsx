import { useState } from "react";
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
  openPlan?: () => void;
}) {
  const [modelNudge, setModelNudge] = useState(0);

  return (
    <section id="explorer" className="explorer-section section-screen">
      <div className="section-inner explorer-inner">
        <div className="section-title reveal">
          <h4>Explore every level. Visualize your view.</h4>
        </div>

        <div className="model-stage reveal">
          <button className="model-arrow left" type="button" onClick={() => setModelNudge((value) => value - 1)} aria-label="Rotate building left">
            <ArrowLeft />
          </button>
          <div className="model-canvas">
            <BuildingModel selected={selectedFloor} nudge={modelNudge} />
            <div className="model-hint"><Rotate3D size={30} /> Drag to rotate · pinch to zoom</div>
          </div>
          <button className="model-arrow right" type="button" onClick={() => setModelNudge((value) => value + 1)} aria-label="Rotate building right">
            <ArrowRight />
          </button>
        </div>

        <div className="floor-picker reveal">
          <span>Select Floor Range</span>
          <div className="floor-pills-grid">
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
      </div>
    </section>
  );
}
