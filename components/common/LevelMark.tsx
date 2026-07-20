import Image from "next/image";

export function LevelMark() {
  return (
    <div className="level-mark" aria-label="Level 23">
      <Image src="/images/logos/level23.png" alt="Level 23 – Premium Office Spaces" className="level-mark-logo" width={160} height={72} />
    </div>
  );
}
