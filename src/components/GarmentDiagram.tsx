import type { GarmentConfig } from '../lib/calculator';

// Labeled measurement arrow helpers
function Arrow({
  x1, y1, x2, y2, label, labelX, labelY, fontSize = 10,
}: {
  x1: number; y1: number; x2: number; y2: number;
  label: string; labelX: number; labelY: number; fontSize?: number;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#be123c" strokeWidth={1} markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x={labelX} y={labelY} fontSize={fontSize} fill="#be123c" textAnchor="middle" fontFamily="sans-serif" fontWeight="600">{label}</text>
    </g>
  );
}

function Dashed({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3,3" />;
}

// Body diagram: front/back flat lay
export function BodyDiagram({ config }: { config: GarmentConfig }) {
  const hasWaist = true; // always show waist measurement point

  return (
    <svg viewBox="0 0 320 340" className="w-full max-w-sm mx-auto" aria-label="Garment body measurement diagram">
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#be123c" />
        </marker>
      </defs>

      {/* Garment outline — flat-lay body */}
      {/* Shoulders */}
      <path
        d="M 80,50 L 100,30 L 140,40 L 160,40 L 200,30 L 220,50
           L 220,110 L 200,115
           L 200,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290
           L 120,290 L 120,290
           L 120,290 L 120,290 L 120,290 L 120,290 L 120,290
           L 120,290 L 120,290
           L 120,290 L 120,290
           L 120,290 L 120,290
           L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290
           L 120,290
           L 120,290 L 120,290
           L 120,290
           L 120,290 L 120,290 L 120,290 L 120,290 L 120,290 L 120,290
           L 120,290
           L 100,290 L 100,115 L 80,110 Z"
        fill="none" stroke="#374151" strokeWidth={0} opacity={0}
      />

      {/* Clean body shape */}
      <g stroke="#374151" strokeWidth="1.5" fill="#f9fafb">
        {/* Body silhouette */}
        <path d="
          M 100,50
          C 105,35 125,30 150,30
          C 175,30 195,35 200,50
          L 215,55
          L 215,115
          L 200,118
          L 205,155
          L 210,200
          L 208,250
          L 205,285
          L 95,285
          L 92,250
          L 90,200
          L 95,155
          L 100,118
          L 85,115
          L 85,55
          Z
        " />
        {/* Armhole curves */}
        <path d="M 215,55 C 225,60 228,80 225,100 C 222,110 217,115 215,115" fill="none" />
        <path d="M 85,55 C 75,60 72,80 75,100 C 78,110 83,115 85,115" fill="none" />
        {/* Neckline */}
        {config.collar === 'vneck' && (
          <path d="M 100,50 C 105,35 125,30 150,30 C 175,30 195,35 200,50 L 150,95 Z" fill="#e5e7eb" />
        )}
        {config.collar === 'scoop' && (
          <path d="M 108,46 C 120,65 180,65 192,46" fill="none" stroke="#374151" strokeWidth="1.5" />
        )}
        {(config.collar === 'crew' || config.collar === 'turtleneck') && (
          <ellipse cx="150" cy="44" rx="35" ry="18" fill="#e5e7eb" />
        )}
        {config.collar === 'boat' && (
          <path d="M 108,42 L 192,42" fill="none" stroke="#374151" strokeWidth="1.5" />
        )}
      </g>

      {/* Measurement guide lines */}
      <Dashed x1={85} y1={118} x2={30} y2={118} />
      <Dashed x1={215} y1={118} x2={270} y2={118} />
      <Dashed x1={85} y1={55} x2={30} y2={55} />
      <Dashed x1={215} y1={55} x2={270} y2={55} />
      <Dashed x1={90} y1={200} x2={30} y2={200} />
      <Dashed x1={210} y1={200} x2={270} y2={200} />
      <Dashed x1={92} y1={285} x2={30} y2={285} />
      <Dashed x1={205} y1={285} x2={270} y2={285} />
      <Dashed x1={100} y1={50} x2={100} y2={15} />
      <Dashed x1={200} y1={50} x2={200} y2={15} />
      <Dashed x1={117} y1={30} x2={117} y2={15} />
      <Dashed x1={183} y1={30} x2={183} y2={15} />

      {/* Armhole depth — left side, shoulder top to underarm */}
      <Arrow x1={32} y1={55} x2={32} y2={118} label="5" labelX={22} labelY={88} />

      {/* Chest width */}
      <Arrow x1={88} y1={122} x2={212} y2={122} label="1" labelX={150} labelY={135} />

      {/* Waist width */}
      {hasWaist && <Arrow x1={93} y1={204} x2={207} y2={204} label="2" labelX={150} labelY={196} />}

      {/* Hem width */}
      <Arrow x1={95} y1={289} x2={205} y2={289} label="3" labelX={150} labelY={301} />

      {/* Total body length — right side */}
      <Dashed x1={150} y1={30} x2={280} y2={30} />
      <Arrow x1={272} y1={30} x2={272} y2={285} label="4" labelX={284} labelY={158} />

      {/* Shoulder width (top) */}
      <Arrow x1={100} y1={12} x2={117} y2={12} label="6" labelX={109} labelY={8} />
      {/* Back neck width */}
      <Arrow x1={117} y1={12} x2={183} y2={12} label="7" labelX={150} labelY={8} />
      {/* Other shoulder */}
      <Arrow x1={183} y1={12} x2={200} y2={12} label="6" labelX={191} labelY={8} />

      {/* Front neck drop */}
      {config.collar !== 'boat' && (
        <>
          <Dashed x1={150} y1={30} x2={310} y2={30} />
          <Dashed x1={150} y1={70} x2={310} y2={70} />
          <Arrow x1={305} y1={30} x2={305} y2={70} label="9" labelX={315} labelY={52} />
        </>
      )}

      {/* Labels legend */}
      <text x="150" y="320" fontSize="8.5" fill="#6b7280" textAnchor="middle" fontFamily="sans-serif">
        Lay garment flat. Measure straight across or straight down.
      </text>
    </svg>
  );
}

// Sleeve diagram
export function SleeveDiagram({ construction }: { construction: string }) {
  return (
    <svg viewBox="0 0 280 300" className="w-full max-w-xs mx-auto" aria-label="Sleeve measurement diagram">
      <defs>
        <marker id="arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#be123c" />
        </marker>
      </defs>

      {/* Sleeve outline */}
      <g stroke="#374151" strokeWidth="1.5" fill="#f9fafb">
        {construction === 'set-in' ? (
          <path d="
            M 60,50
            C 80,20 200,20 220,50
            C 230,65 228,85 220,100
            L 210,140
            L 195,240
            L 175,265
            L 105,265
            L 85,240
            L 70,140
            L 60,100
            C 52,85 50,65 60,50
            Z
          " />
        ) : construction === 'raglan' ? (
          <path d="
            M 75,30 L 205,30
            L 215,70
            L 210,140
            L 195,240
            L 175,265
            L 105,265
            L 85,240
            L 70,140
            L 65,70
            Z
          " />
        ) : (
          /* drop shoulder — rectangular top */
          <path d="
            M 60,40 L 220,40
            L 215,140
            L 200,240
            L 175,265
            L 105,265
            L 80,240
            L 65,140
            Z
          " />
        )}
      </g>

      {/* Guide lines */}
      <Dashed x1={60} y1={construction === 'drop-shoulder' ? 40 : 100} x2={20} y2={construction === 'drop-shoulder' ? 40 : 100} />
      <Dashed x1={220} y1={construction === 'drop-shoulder' ? 40 : 100} x2={260} y2={construction === 'drop-shoulder' ? 40 : 100} />
      <Dashed x1={80} y1={265} x2={20} y2={265} />
      <Dashed x1={200} y1={265} x2={260} y2={265} />

      {/* Upper sleeve width */}
      <Arrow
        x1={63} y1={construction === 'drop-shoulder' ? 44 : 104}
        x2={217} y2={construction === 'drop-shoulder' ? 44 : 104}
        label="14"
        labelX={140}
        labelY={construction === 'drop-shoulder' ? 116 : 118}
      />

      {/* Cuff width */}
      <Arrow x1={83} y1={269} x2={197} y2={269} label="15" labelX={140} labelY={281} />

      {/* Sleeve length */}
      <Arrow x1={22} y1={construction === 'drop-shoulder' ? 40 : 100} x2={22} y2={265} label="13" labelX={10} labelY={183} />

      {/* Sleeve cap height (set-in only) */}
      {construction === 'set-in' && (
        <>
          <Dashed x1={140} y1={30} x2={265} y2={30} />
          <Arrow x1={258} y1={30} x2={258} y2={100} label="16" labelX={270} labelY={65} />
        </>
      )}

      <text x="140" y="292" fontSize="8.5" fill="#6b7280" textAnchor="middle" fontFamily="sans-serif">
        {construction === 'set-in'
          ? 'Measure 13 from underarm seam to cuff edge (along underside).'
          : 'Measure 13 from top edge to cuff edge along the side.'}
      </text>
    </svg>
  );
}
