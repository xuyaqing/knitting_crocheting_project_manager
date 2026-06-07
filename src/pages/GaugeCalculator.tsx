import { useState, useEffect } from 'react';
import { calculate } from '../lib/calculator';
import type {
  Gauge, GarmentConfig, Measurements, CalculatorResult,
  Unit, GarmentType, SleeveConstruction, SleeveLength, CollarShape,
} from '../lib/calculator';
import { BodyDiagram, SleeveDiagram } from '../components/GarmentDiagram';

// ── small UI helpers ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function NumberInput({
  label, value, onChange, unit, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; unit: string; hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.25"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

function Select<T extends string>({
  label, value, onChange, options, hint,
}: {
  label: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[]; hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-rose-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function MeasurementLegend({ items }: { items: { num: string | number; label: string; hint: string }[] }) {
  return (
    <div className="mt-4 space-y-1.5">
      {items.map(item => (
        <div key={item.num} className="flex gap-2 text-sm">
          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            {item.num}
          </span>
          <div>
            <span className="font-medium text-gray-800">{item.label}: </span>
            <span className="text-gray-600">{item.hint}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PieceCard({ piece }: { piece: CalculatorResult['pieces'][number] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 text-base mb-1">{piece.name}</h3>
      <p className="text-sm text-gray-500 mb-3">
        Cast on: <strong className="text-gray-800">{piece.castOn} sts</strong> &nbsp;|&nbsp;
        Total rows: <strong className="text-gray-800">{piece.totalRows}</strong>
      </p>
      <ol className="space-y-3">
        {piece.instructions.map((instr, i) => (
          <li key={i} className="border-l-2 border-rose-200 pl-3">
            <p className="text-sm font-mono text-gray-800 leading-relaxed">{instr.patternNote}</p>
            <p className="text-xs text-gray-500 mt-0.5 italic">{instr.plainNote}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── default form state ────────────────────────────────────────────────────────

const emptyMeasurements = {
  chestWidth: '', waistWidth: '', hemWidth: '', bodyLength: '',
  armholeDepth: '', shoulderWidth: '', backNeckWidth: '',
  frontNeckDrop: '', frontNeckWidth: '', backNeckDrop: '', collarHeight: '',
  sleeveLength: '', upperSleeveWidth: '', cuffWidth: '', sleeveCapHeight: '',
};

const emptyGauge = {
  swatchWidth: '', swatchHeight: '', swatchWeightG: '',
  stitchesPer4: '', rowsPer4: '', skeinWeightG: '',
};

const STORAGE_KEY = 'gauge-calculator-v1';

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

// ── export helper ─────────────────────────────────────────────────────────────

function exportToText(result: CalculatorResult, config: GarmentConfig, skeinWeightG: string) {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  lines.push('KNITTING PATTERN — STITCH CALCULATOR OUTPUT');
  lines.push(`Generated: ${date}`);
  lines.push('');
  lines.push(`Gauge: ${result.gauge.stitchesPerInch.toFixed(2)} sts/in · ${result.gauge.rowsPerInch.toFixed(2)} rows/in`);
  lines.push(`Waist shaping: ${result.waistShaping === 'hourglass' ? 'Hourglass' : 'Straight'}`);
  lines.push(`Garment: ${config.type} | Collar: ${config.collar} | Construction: ${config.sleeveConstruction}`);
  if (result.yarnEstimate) {
    lines.push('');
    lines.push('YARN ESTIMATE');
    lines.push(`Minimum: ${result.yarnEstimate.totalGrams}g`);
    lines.push(`Recommended (with 15% buffer): ${result.yarnEstimate.withBuffer}g`);
    if (skeinWeightG && parseFloat(skeinWeightG) > 0) {
      lines.push(`Skeins to buy (${skeinWeightG}g each): ${Math.ceil(result.yarnEstimate.withBuffer / parseFloat(skeinWeightG))}`);
    }
  }
  lines.push('');
  lines.push('─'.repeat(60));

  for (const piece of result.pieces) {
    lines.push('');
    lines.push(piece.name.toUpperCase());
    lines.push(`Cast on: ${piece.castOn} sts | Total rows: ${piece.totalRows}`);
    lines.push('');
    piece.instructions.forEach((instr, i) => {
      lines.push(`${i + 1}. ${instr.patternNote}`);
      lines.push(`   ${instr.plainNote}`);
      lines.push('');
    });
    lines.push('─'.repeat(60));
  }

  lines.push('');
  lines.push('FINISHING NOTES');
  result.finishingNotes.forEach(note => lines.push(`• ${note}`));
  lines.push('');
  lines.push('Always knit a swatch and adjust needle size if needed before starting your garment.');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `knitting-pattern-${date.replace(/\s+/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── main component ────────────────────────────────────────────────────────────

export function GaugeCalculator() {
  const saved = loadSaved();

  const [unit, setUnit] = useState<Unit>(saved.unit ?? 'in');
  const [g, setG] = useState({ ...emptyGauge, ...saved.g });

  const [garmentType, setGarmentType] = useState<GarmentType>(saved.garmentType ?? 'pullover');
  const [sleeveConstruction, setSleeveConstruction] = useState<SleeveConstruction>(saved.sleeveConstruction ?? 'set-in');
  const [sleeveLength, setSleeveLength] = useState<SleeveLength>(saved.sleeveLength ?? 'full');
  const [collar, setCollar] = useState<CollarShape>(saved.collar ?? 'crew');

  const [m, setM] = useState({ ...emptyMeasurements, ...saved.m });
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      unit, g, garmentType, sleeveConstruction, sleeveLength, collar, m,
    }));
  }, [unit, g, garmentType, sleeveConstruction, sleeveLength, collar, m]);

  function setGaugeField(key: keyof typeof emptyGauge, val: string) {
    setG((prev: typeof emptyGauge) => ({ ...prev, [key]: val }));
  }

  const unitLabel = unit === 'in' ? 'in' : 'cm';
  const unitPer = unit === 'in' ? '4 in' : '10 cm';
  const hasSleeve = garmentType !== 'vest';

  function setField(key: keyof typeof emptyMeasurements, val: string) {
    setM((prev: typeof emptyMeasurements) => ({ ...prev, [key]: val }));
  }

  function handleCalculate() {
    setError('');
    const required: (keyof typeof emptyMeasurements)[] = [
      'chestWidth', 'waistWidth', 'hemWidth', 'bodyLength',
      'armholeDepth', 'shoulderWidth', 'backNeckWidth',
      'frontNeckDrop', 'frontNeckWidth', 'backNeckDrop', 'collarHeight',
    ];
    if (hasSleeve) required.push('sleeveLength', 'upperSleeveWidth', 'cuffWidth');
    if (sleeveConstruction === 'set-in' && hasSleeve) required.push('sleeveCapHeight');

    const zeroAllowed = new Set<keyof typeof emptyMeasurements>(['collarHeight', 'backNeckDrop']);
    const missing = required.filter(k => m[k] === '' || (!zeroAllowed.has(k) && parseFloat(m[k]) <= 0));
    if (!g.stitchesPer4 || !g.rowsPer4) {
      setError('Please enter your gauge (stitches and rows per ' + unitPer + ').');
      return;
    }
    if (missing.length > 0) {
      setError(`Please fill in all measurements. Missing: ${missing.join(', ').replace(/_/g, ' ')}.`);
      return;
    }

    const swatchW = parseFloat(g.swatchWidth);
    const swatchH = parseFloat(g.swatchHeight);
    const swatchWt = parseFloat(g.swatchWeightG);
    const swatchAreaSqIn = unit === 'cm'
      ? (swatchW / 2.54) * (swatchH / 2.54)
      : swatchW * swatchH;
    const gramsPerSqIn = (swatchW > 0 && swatchH > 0 && swatchWt > 0)
      ? swatchWt / swatchAreaSqIn
      : undefined;

    const gauge: Gauge = {
      stitchesPer4: parseFloat(g.stitchesPer4),
      rowsPer4: parseFloat(g.rowsPer4),
      unit,
      gramsPerSqIn,
    };
    const config: GarmentConfig = { type: garmentType, sleeveConstruction, sleeveLength, collar };
    const measurements: Measurements = {
      chestWidth: parseFloat(m.chestWidth),
      waistWidth: parseFloat(m.waistWidth),
      hemWidth: parseFloat(m.hemWidth),
      bodyLength: parseFloat(m.bodyLength),
      armholeDepth: parseFloat(m.armholeDepth),
      shoulderWidth: parseFloat(m.shoulderWidth),
      backNeckWidth: parseFloat(m.backNeckWidth),
      frontNeckDrop: parseFloat(m.frontNeckDrop),
      frontNeckWidth: parseFloat(m.frontNeckWidth),
      backNeckDrop: parseFloat(m.backNeckDrop),
      collarHeight: parseFloat(m.collarHeight),
      ...(hasSleeve && {
        sleeveLength: parseFloat(m.sleeveLength),
        upperSleeveWidth: parseFloat(m.upperSleeveWidth),
        cuffWidth: parseFloat(m.cuffWidth),
        ...(sleeveConstruction === 'set-in' && { sleeveCapHeight: parseFloat(m.sleeveCapHeight) }),
      }),
    };

    try {
      setResult(calculate(gauge, config, measurements));
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      setError('Something went wrong with the calculation. Please check your measurements.');
    }
  }

  const config: GarmentConfig = { type: garmentType, sleeveConstruction, sleeveLength, collar };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stitch Calculator</h1>
        <p className="text-gray-500 mt-1">
          Measure a garment you love and get a full pattern stitch count and shaping instructions.
        </p>
      </div>

      {/* ── STEP 1: GAUGE ────────────────────────────────────────────────────── */}
      <section>
        <StepHeader
          step={1}
          title="Your Gauge Swatch"
          subtitle="Measure and weigh your swatch, then count stitches and rows from its center."
        />
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <Select<Unit>
            label="Unit system"
            value={unit}
            onChange={setUnit}
            options={[{ value: 'in', label: 'Inches' }, { value: 'cm', label: 'Centimetres' }]}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Swatch size &amp; weight</p>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Width"
                value={g.swatchWidth}
                onChange={v => setGaugeField('swatchWidth', v)}
                unit={unitLabel}
                hint="Measured edge to edge."
              />
              <NumberInput
                label="Height"
                value={g.swatchHeight}
                onChange={v => setGaugeField('swatchHeight', v)}
                unit={unitLabel}
                hint="Measured edge to edge."
              />
              <NumberInput
                label="Weight"
                value={g.swatchWeightG}
                onChange={v => setGaugeField('swatchWeightG', v)}
                unit="g"
                hint="Weigh on a kitchen or postal scale."
              />
            </div>
            {g.swatchWidth && g.swatchHeight && g.swatchWeightG && (
              <p className="text-xs text-rose-600 mt-2">
                Density: {(parseFloat(g.swatchWeightG) / (unit === 'cm'
                  ? (parseFloat(g.swatchWidth) / 2.54) * (parseFloat(g.swatchHeight) / 2.54)
                  : parseFloat(g.swatchWidth) * parseFloat(g.swatchHeight))).toFixed(3)} g/sq in
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Stitch count (from swatch center)</p>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label={`Stitches per ${unitPer}`}
                value={g.stitchesPer4}
                onChange={v => setGaugeField('stitchesPer4', v)}
                unit="sts"
                hint="Count across the center, not the edges."
              />
              <NumberInput
                label={`Rows per ${unitPer}`}
                value={g.rowsPer4}
                onChange={v => setGaugeField('rowsPer4', v)}
                unit="rows"
                hint="Count top-to-bottom in the center."
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Skein weight <span className="font-normal text-gray-400">(optional — for skein count estimate)</span></p>
            <NumberInput
              label="Weight per skein"
              value={g.skeinWeightG}
              onChange={v => setGaugeField('skeinWeightG', v)}
              unit="g"
              hint="Check your yarn label. Common: 50g, 100g, 200g."
            />
          </div>
        </div>
      </section>

      {/* ── STEP 2: GARMENT SETUP ────────────────────────────────────────────── */}
      <section>
        <StepHeader step={2} title="Garment Setup" />
        <div className="bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-2 gap-4">
          <Select<GarmentType>
            label="Garment type"
            value={garmentType}
            onChange={setGarmentType}
            options={[
              { value: 'vest', label: 'Vest (no sleeves)' },
              { value: 'pullover', label: 'Pullover sweater' },
              { value: 'cardigan', label: 'Cardigan (open front)' },
            ]}
          />
          {garmentType !== 'vest' && (
            <Select<SleeveConstruction>
              label="Sleeve construction"
              value={sleeveConstruction}
              onChange={setSleeveConstruction}
              hint="Look at where the sleeve meets the body."
              options={[
                { value: 'set-in', label: 'Set-in (curved armhole seam)' },
                { value: 'drop-shoulder', label: 'Drop shoulder (seam on upper arm)' },
                { value: 'raglan', label: 'Raglan (diagonal seam to neck)' },
              ]}
            />
          )}
          {garmentType !== 'vest' && (
            <Select<SleeveLength>
              label="Sleeve length"
              value={sleeveLength}
              onChange={setSleeveLength}
              options={[
                { value: 'short', label: 'Short (cap / puff)' },
                { value: 'three-quarter', label: '3/4 length' },
                { value: 'full', label: 'Full length' },
              ]}
            />
          )}
          <Select<CollarShape>
            label="Collar / neckline shape"
            value={collar}
            onChange={setCollar}
            options={[
              { value: 'crew', label: 'Crew neck (round, close)' },
              { value: 'vneck', label: 'V-neck' },
              { value: 'scoop', label: 'Scoop neck (wide, deep round)' },
              { value: 'boat', label: 'Boat neck (wide, shallow)' },
              { value: 'turtleneck', label: 'Turtleneck / cowl' },
            ]}
          />
        </div>
      </section>

      {/* ── STEP 3: MEASUREMENTS ─────────────────────────────────────────────── */}
      <section>
        <StepHeader
          step={3}
          title="Garment Measurements"
          subtitle="Lay your reference garment flat on a table. Use the diagrams below to locate each measurement point."
        />

        {/* Body diagram */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">Body — where to measure</h3>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-64 flex-shrink-0">
              <BodyDiagram config={config} />
            </div>
            <MeasurementLegend items={[
              { num: 1, label: 'Chest width', hint: 'Straight across the widest point, just below the armhole.' },
              { num: 2, label: 'Waist width', hint: 'Straight across the narrowest point of the body.' },
              { num: 3, label: 'Hem width', hint: 'Straight across at the very bottom edge.' },
              { num: 4, label: 'Total body length', hint: 'From the highest point of the shoulder seam straight down to the hem.' },
              { num: 5, label: 'Armhole depth', hint: 'From the shoulder seam top straight down to the lowest point of the armhole curve (the underarm). The calculator derives the below-armhole section from 4 − 5.' },
              { num: 6, label: 'Shoulder width', hint: 'From the neck edge of the shoulder seam to the outer edge — measure each side.' },
              { num: 7, label: 'Back neck width', hint: 'Across the back between the two inner shoulder seam edges.' },
              { num: 9, label: 'Front neck drop', hint: 'From an imaginary straight line across the shoulder tips down to the lowest point of the front neckline.' },
            ]} />
          </div>

          {/* Body measurement inputs */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumberInput label="1 — Chest width" value={m.chestWidth} onChange={v => setField('chestWidth', v)} unit={unitLabel} hint="Just below armhole, straight across." />
            <NumberInput label="2 — Waist width" value={m.waistWidth} onChange={v => setField('waistWidth', v)} unit={unitLabel} hint="Narrowest body point." />
            <NumberInput label="3 — Hem width" value={m.hemWidth} onChange={v => setField('hemWidth', v)} unit={unitLabel} hint="Bottom edge." />
            <NumberInput label="4 — Total body length" value={m.bodyLength} onChange={v => setField('bodyLength', v)} unit={unitLabel} hint="Shoulder seam to hem." />
            <NumberInput label="5 — Armhole depth" value={m.armholeDepth} onChange={v => setField('armholeDepth', v)} unit={unitLabel} hint="Shoulder seam down to underarm curve." />
            <NumberInput label="6 — Shoulder width (one side)" value={m.shoulderWidth} onChange={v => setField('shoulderWidth', v)} unit={unitLabel} hint="Neck edge to armhole edge, along shoulder." />
            <NumberInput label="7 — Back neck width" value={m.backNeckWidth} onChange={v => setField('backNeckWidth', v)} unit={unitLabel} hint="Between the two inner shoulder seam edges." />
          </div>
        </div>

        {/* Neckline inputs */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">Neckline measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumberInput
              label="9 — Front neck drop"
              value={m.frontNeckDrop}
              onChange={v => setField('frontNeckDrop', v)}
              unit={unitLabel}
              hint="From shoulder line down to lowest front neckline point."
            />
            <NumberInput
              label="Front neck width"
              value={m.frontNeckWidth}
              onChange={v => setField('frontNeckWidth', v)}
              unit={unitLabel}
              hint="Across the widest part of the front neck opening."
            />
            <NumberInput
              label="Back neck drop"
              value={m.backNeckDrop}
              onChange={v => setField('backNeckDrop', v)}
              unit={unitLabel}
              hint="Usually 0–1 in. Enter 0 if neckline is flat across the back."
            />
            {(collar === 'turtleneck' || collar === 'crew') && (
              <NumberInput
                label="Collar height"
                value={m.collarHeight}
                onChange={v => setField('collarHeight', v)}
                unit={unitLabel}
                hint="How tall the collar stands when worn (before folding over for turtleneck)."
              />
            )}
            {(collar !== 'turtleneck' && collar !== 'crew') && (
              <div>
                <Label>Collar height</Label>
                <p className="text-xs text-gray-400 italic">Not applicable for this neckline — enter 0.</p>
                <input type="hidden" value="0" />
                <input
                  type="number" value={m.collarHeight} onChange={e => setField('collarHeight', e.target.value)}
                  className="w-28 border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-400 mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sleeve measurements */}
        {hasSleeve && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-medium text-gray-800 mb-3">Sleeve — where to measure</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-52 flex-shrink-0">
                <SleeveDiagram construction={sleeveConstruction} />
              </div>
              <MeasurementLegend items={[
                { num: 13, label: 'Sleeve length', hint: sleeveConstruction === 'drop-shoulder' ? 'From the top edge of the sleeve to the cuff edge, along the side.' : 'From the underarm seam point to the cuff edge, along the underside of the sleeve.' },
                { num: 14, label: 'Upper sleeve width', hint: 'Straight across at the widest point of the sleeve.' },
                { num: 15, label: 'Cuff width', hint: 'Straight across at the finished cuff edge.' },
                ...(sleeveConstruction === 'set-in' ? [{ num: 16, label: 'Sleeve cap height', hint: 'From where the sleeve cap meets the body armhole seam up to the very top (shoulder tip). Only for set-in sleeves.' }] : []),
              ]} />
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <NumberInput label="13 — Sleeve length" value={m.sleeveLength} onChange={v => setField('sleeveLength', v)} unit={unitLabel} hint={sleeveConstruction === 'drop-shoulder' ? 'Top to cuff.' : 'Underarm to cuff.'} />
              <NumberInput label="14 — Upper sleeve width" value={m.upperSleeveWidth} onChange={v => setField('upperSleeveWidth', v)} unit={unitLabel} hint="Widest point." />
              <NumberInput label="15 — Cuff width" value={m.cuffWidth} onChange={v => setField('cuffWidth', v)} unit={unitLabel} hint="Cuff edge." />
              {sleeveConstruction === 'set-in' && (
                <NumberInput label="16 — Sleeve cap height" value={m.sleeveCapHeight} onChange={v => setField('sleeveCapHeight', v)} unit={unitLabel} hint="Armhole seam to shoulder tip (set-in only)." />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── CALCULATE BUTTON ─────────────────────────────────────────────────── */}
      <div>
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        <button
          onClick={handleCalculate}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-colors text-base"
        >
          Calculate Pattern
        </button>
      </div>

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      {result && (
        <section id="results" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pattern Instructions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gauge: {result.gauge.stitchesPerInch.toFixed(2)} sts/in · {result.gauge.rowsPerInch.toFixed(2)} rows/in &nbsp;|&nbsp;
                Waist shaping: <span className={result.waistShaping === 'hourglass' ? 'text-rose-600 font-medium' : 'text-gray-600'}>
                  {result.waistShaping === 'hourglass' ? 'Hourglass (waist shaping included)' : 'Straight body (no waist shaping)'}
                </span>
              </p>
            </div>
            <button
              onClick={() => exportToText(result, config, g.skeinWeightG)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-gray-300 hover:border-rose-400 hover:text-rose-600 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save as .txt
            </button>
          </div>

          {result.yarnEstimate && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-5">
              <h3 className="font-semibold text-rose-900 mb-1">Yarn Estimate</h3>
              <p className="text-sm text-rose-700 mb-2">
                Includes 15% buffer for seaming, swatch, and safety margin.
              </p>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-rose-500 uppercase tracking-wide">Minimum</p>
                  <p className="text-2xl font-bold text-rose-800">{result.yarnEstimate.totalGrams}g</p>
                </div>
                <div>
                  <p className="text-xs text-rose-500 uppercase tracking-wide">Recommended (with buffer)</p>
                  <p className="text-2xl font-bold text-rose-800">{result.yarnEstimate.withBuffer}g</p>
                </div>
                {g.skeinWeightG && parseFloat(g.skeinWeightG) > 0 && (
                  <div>
                    <p className="text-xs text-rose-500 uppercase tracking-wide">Skeins to buy ({g.skeinWeightG}g each)</p>
                    <p className="text-2xl font-bold text-rose-800">
                      {Math.ceil(result.yarnEstimate.withBuffer / parseFloat(g.skeinWeightG))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.pieces.map((piece, i) => (
            <PieceCard key={i} piece={piece} />
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-semibold text-amber-900 mb-2">Finishing Notes</h3>
            <ul className="space-y-1">
              {result.finishingNotes.map((note, i) => (
                <li key={i} className="text-sm text-amber-800 flex gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 text-center pb-4">
            These numbers are calculated from your measurements and gauge. Always knit a swatch and adjust needle size if needed before starting your garment.
          </p>
        </section>
      )}
    </div>
  );
}
