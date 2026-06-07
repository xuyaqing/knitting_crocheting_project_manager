export type Unit = 'in' | 'cm';
export type GarmentType = 'vest' | 'pullover' | 'cardigan';
export type SleeveConstruction = 'set-in' | 'drop-shoulder' | 'raglan';
export type SleeveLength = 'sleeveless' | 'short' | 'three-quarter' | 'full';
export type CollarShape = 'crew' | 'vneck' | 'scoop' | 'boat' | 'turtleneck';

export interface Gauge {
  stitchesPer4: number;
  rowsPer4: number;
  unit: Unit;
  gramsPerSqIn?: number;
}

export interface Measurements {
  // Body
  chestWidth: number;
  waistWidth: number;
  hemWidth: number;
  bodyLength: number;
  armholeDepth: number;
  // Shoulder
  shoulderWidth: number;
  backNeckWidth: number;
  // Neckline
  frontNeckDrop: number;
  frontNeckWidth: number;
  backNeckDrop: number;
  collarHeight: number;
  // Sleeve (optional)
  sleeveLength?: number;
  upperSleeveWidth?: number;
  cuffWidth?: number;
  sleeveCapHeight?: number;
}

export interface GarmentConfig {
  type: GarmentType;
  sleeveConstruction: SleeveConstruction;
  sleeveLength: SleeveLength;
  collar: CollarShape;
}

export interface ShapingInstruction {
  patternNote: string;
  plainNote: string;
}

export interface PieceInstructions {
  name: string;
  castOn: number;
  totalRows: number;
  instructions: ShapingInstruction[];
}

export interface YarnEstimate {
  totalGrams: number;
  withBuffer: number;
}

export interface CalculatorResult {
  gauge: { stitchesPerInch: number; rowsPerInch: number };
  waistShaping: 'straight' | 'hourglass';
  pieces: PieceInstructions[];
  finishingNotes: string[];
  yarnEstimate?: YarnEstimate;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toInches(value: number, unit: Unit): number {
  return unit === 'cm' ? value / 2.54 : value;
}

function sts(inches: number, spi: number): number {
  return Math.round(inches * spi);
}

function rows(inches: number, rpi: number): number {
  return Math.round(inches * rpi);
}

function evenNumber(n: number): number {
  return n % 2 === 0 ? n : n + 1;
}

function shapingInterval(totalRows: number, timesNeeded: number): number {
  if (timesNeeded <= 0) return 0;
  return Math.max(2, Math.floor(totalRows / timesNeeded));
}

// ── shaping instruction builders ──────────────────────────────────────────────

function decreaseInstruction(
  times: number,
  everyNRows: number,
  label: string
): ShapingInstruction {
  return {
    patternNote: `Dec 1 st each end every ${everyNRows} rows, ${times} times. (${label})`,
    plainNote: `On both sides, reduce by 1 stitch once every ${everyNRows} rows — do this ${times} times total.`,
  };
}

function increaseInstruction(
  times: number,
  everyNRows: number,
  label: string
): ShapingInstruction {
  return {
    patternNote: `Inc 1 st each end every ${everyNRows} rows, ${times} times. (${label})`,
    plainNote: `On both sides, add 1 stitch once every ${everyNRows} rows — do this ${times} times total.`,
  };
}

function bindOffInstruction(count: number, label: string): ShapingInstruction {
  return {
    patternNote: `BO ${count} sts at beg of next 2 rows. (${label})`,
    plainNote: `Bind off ${count} stitches at the start of the next two rows (one bind-off each side). ${label}`,
  };
}

function straightInstruction(totalRows: number, label: string): ShapingInstruction {
  return {
    patternNote: `Work straight for ${totalRows} rows. (${label})`,
    plainNote: `Knit without any increases or decreases for ${totalRows} rows. ${label}`,
  };
}

// ── armhole shaping ───────────────────────────────────────────────────────────

function setInArmhole(
  startSts: number,
  armholeDepthIn: number,
  rpi: number,
  _spi: number
): { instructions: ShapingInstruction[]; stitchesAfter: number } {
  const armholeRows = rows(armholeDepthIn, rpi);
  // Initial bind-off: ~5% of stitch count, min 3
  const initialBO = Math.max(3, Math.round(startSts * 0.05));
  // Then decrease every RS row (every 2 rows) for ~15% of armhole rows
  const decRows = Math.round(armholeRows * 0.35);
  const decTimes = Math.round(decRows / 2);
  const stitchesAfter = startSts - initialBO * 2 - decTimes * 2;
  const remainingRows = armholeRows - initialBO - decTimes * 2;

  const instructions: ShapingInstruction[] = [
    bindOffInstruction(initialBO, 'armhole shaping start'),
    decreaseInstruction(decTimes, 2, 'armhole curve'),
    straightInstruction(Math.max(0, remainingRows), 'armhole body'),
  ];
  return { instructions, stitchesAfter };
}

function dropShoulderArmhole(
  armholeDepthIn: number,
  rpi: number
): ShapingInstruction[] {
  return [straightInstruction(rows(armholeDepthIn, rpi), 'straight to shoulder — drop shoulder, no armhole shaping needed')];
}

// ── shoulder shaping ──────────────────────────────────────────────────────────

function shoulderShaping(
  shoulderStsEachSide: number
): ShapingInstruction[] {
  // Bind off in 2–3 steps for a smoother slope
  const step1 = Math.round(shoulderStsEachSide / 2);
  const step2 = shoulderStsEachSide - step1;
  return [
    {
      patternNote: `BO ${step1} sts at beg of next 2 rows, then BO ${step2} sts at beg of foll 2 rows. (shoulder slope)`,
      plainNote: `Bind off the shoulder stitches in two stages: first ${step1} stitches on each side, then the remaining ${step2} stitches on each side. This creates a gentle slope at the shoulder.`,
    },
  ];
}

// ── neckline shaping ──────────────────────────────────────────────────────────

function necklineShaping(
  collar: CollarShape,
  totalFrontSts: number,
  frontNeckWidthIn: number,
  frontNeckDropIn: number,
  backNeckDropIn: number,
  spi: number,
  rpi: number
): ShapingInstruction[] {
  const neckSts = sts(frontNeckWidthIn, spi);
  const eachSideSts = Math.round((totalFrontSts - neckSts) / 2);
  const instructions: ShapingInstruction[] = [];

  if (collar === 'vneck') {
    const dropRows = rows(frontNeckDropIn, rpi);
    // V-neck: place center 2 sts on holder, decrease each side every RS row
    const decTimes = eachSideSts;
    const interval = Math.max(2, Math.floor(dropRows / decTimes));
    instructions.push({
      patternNote: `Place center 2 sts on holder. Working each side separately, dec 1 st at neck edge every ${interval} rows, ${decTimes} times. (V-neck shaping)`,
      plainNote: `Put the 2 center stitches on a stitch holder. Then work each half of the front separately, decreasing 1 stitch at the neck edge once every ${interval} rows, repeated ${decTimes} times — this forms the V shape.`,
    });
  } else if (collar === 'crew' || collar === 'turtleneck') {
    const dropRows = rows(Math.max(frontNeckDropIn, 0.75), rpi);
    const centerBO = neckSts;
    const decTimes = Math.round(eachSideSts * 0.6);
    const interval = Math.max(2, Math.floor(dropRows / Math.max(decTimes, 1)));
    instructions.push(
      {
        patternNote: `BO center ${centerBO} sts for front neck. (crew neck start)`,
        plainNote: `Bind off the ${centerBO} center stitches to begin the rounded neck opening.`,
      },
      {
        patternNote: `Working each side separately, dec 1 st at neck edge every ${interval} rows, ${decTimes} times. (crew neck curve)`,
        plainNote: `Finish each side separately, decreasing 1 stitch at the neck edge every ${interval} rows, ${decTimes} times, to round out the neckline.`,
      }
    );
  } else if (collar === 'scoop') {
    const dropRows = rows(frontNeckDropIn, rpi);
    const centerBO = Math.round(neckSts * 0.6);
    const decTimes = Math.round((neckSts - centerBO) / 2);
    const interval = Math.max(2, Math.floor(dropRows / Math.max(decTimes, 1)));
    instructions.push(
      {
        patternNote: `BO center ${centerBO} sts. Working each side separately, dec 1 st at neck edge every ${interval} rows, ${decTimes} times. (scoop neck)`,
        plainNote: `Bind off the ${centerBO} center stitches, then decrease 1 stitch at the neck edge every ${interval} rows, ${decTimes} times on each side — this creates the wider, deeper scoop.`,
      }
    );
  } else if (collar === 'boat') {
    instructions.push({
      patternNote: `BO center ${neckSts} sts for boat neck. Work each side straight to shoulder.`,
      plainNote: `Simply bind off ${neckSts} stitches across the center. Then work each side straight up to the shoulder — boat neck has no neck shaping curve.`,
    });
  }

  if (collar === 'turtleneck' || collar === 'crew') {
    instructions.push({
      patternNote: `Pick up approx ${Math.round(spi * (frontNeckWidthIn + backNeckDropIn + frontNeckDropIn) * 1.5)} sts around neck opening. Work in 1×1 rib for collar.`,
      plainNote: `Pick up stitches evenly around the neck opening and work in 1×1 rib (knit 1, purl 1) for the collar.`,
    });
  }

  return instructions;
}

// ── sleeve cap (set-in) ───────────────────────────────────────────────────────

function setInSleeveCap(
  upperSleeveSts: number,
  sleeveCapHeightIn: number,
  rpi: number
): ShapingInstruction[] {
  const capRows = rows(sleeveCapHeightIn, rpi);
  const initialBO = Math.max(3, Math.round(upperSleeveSts * 0.05));
  const topSts = Math.max(4, Math.round(upperSleeveSts * 0.08));
  const stsToRemove = upperSleeveSts - initialBO * 2 - topSts;
  const decRows = capRows - 2 - 4;
  const decTimes = Math.round(stsToRemove / 2);
  const interval = Math.max(2, Math.floor(decRows / Math.max(decTimes, 1)));

  return [
    bindOffInstruction(initialBO, 'sleeve cap start'),
    decreaseInstruction(decTimes, interval, 'sleeve cap shaping'),
    {
      patternNote: `Dec 1 st each end every 2 rows, until ${topSts} sts rem. BO rem sts. (sleeve cap top)`,
      plainNote: `Decrease 1 stitch on each side every 2 rows until ${topSts} stitches remain, then bind off all remaining stitches.`,
    },
  ];
}

// ── yarn usage estimation ─────────────────────────────────────────────────────

function estimateYarn(
  gramsPerSqIn: number,
  config: GarmentConfig,
  measurements: Measurements,
  unit: Unit
): YarnEstimate {
  const conv = (v: number) => toInches(v, unit);

  const chestIn = conv(measurements.chestWidth);
  const hemIn = conv(measurements.hemWidth);
  const bodyLenIn = conv(measurements.bodyLength);

  // Trapezoid approximation for back (and front) panel
  const panelArea = ((hemIn + chestIn) / 2) * bodyLenIn;
  // Front = same total area as back (cardigan splits into two halves but same total)
  const bodyArea = panelArea * 2;

  // Sleeves
  let sleeveArea = 0;
  if (config.type !== 'vest' && measurements.sleeveLength) {
    const sleeveLen = conv(measurements.sleeveLength);
    const upperIn = conv(measurements.upperSleeveWidth ?? measurements.chestWidth * 0.45);
    const cuffIn = conv(measurements.cuffWidth ?? measurements.chestWidth * 0.25);
    const sleeveBodyArea = ((upperIn + cuffIn) / 2) * sleeveLen;
    const capArea = config.sleeveConstruction === 'set-in' && measurements.sleeveCapHeight
      ? conv(measurements.upperSleeveWidth ?? measurements.chestWidth * 0.45) * conv(measurements.sleeveCapHeight) * 0.5
      : 0;
    sleeveArea = (sleeveBodyArea + capArea) * 2;
  }

  // Collar (rough rectangle)
  const neckCircIn = conv(measurements.frontNeckWidth) + conv(measurements.backNeckWidth);
  const collarArea = neckCircIn * conv(measurements.collarHeight);

  const totalArea = bodyArea + sleeveArea + collarArea;
  const totalGrams = totalArea * gramsPerSqIn;
  return { totalGrams: Math.round(totalGrams), withBuffer: Math.round(totalGrams * 1.15) };
}

// ── main calculation ──────────────────────────────────────────────────────────

export function calculate(
  gauge: Gauge,
  config: GarmentConfig,
  measurements: Measurements
): CalculatorResult {
  const unit = gauge.unit;
  const spiRaw = gauge.stitchesPer4 / (unit === 'cm' ? 10 / 2.54 : 4);
  const rpiRaw = gauge.rowsPer4 / (unit === 'cm' ? 10 / 2.54 : 4);

  const conv = (v: number) => toInches(v, unit);

  const chestIn = conv(measurements.chestWidth);
  const waistIn = conv(measurements.waistWidth);
  const hemIn = conv(measurements.hemWidth);
  const bodyLenIn = conv(measurements.bodyLength);
  const armholeIn = conv(measurements.armholeDepth);
  const shoulderIn = conv(measurements.shoulderWidth);
  const backNeckIn = conv(measurements.backNeckWidth);
  const frontNeckDropIn = conv(measurements.frontNeckDrop);
  const frontNeckWidthIn = conv(measurements.frontNeckWidth);
  const backNeckDropIn = conv(measurements.backNeckDrop);
  const collarHeightIn = conv(measurements.collarHeight);

  // Detect waist shaping: hourglass if waist is >4% narrower than chest
  const waistShaping: 'straight' | 'hourglass' =
    waistIn < chestIn * 0.96 ? 'hourglass' : 'straight';

  const pieces: PieceInstructions[] = [];

  // ── BACK PANEL ──────────────────────────────────────────────────────────────
  {
    const hemSts = evenNumber(sts(hemIn, spiRaw));
    const waistSts = evenNumber(sts(waistIn, spiRaw));
    const chestSts = evenNumber(sts(chestIn, spiRaw));
    const shoulderSts = evenNumber(sts(shoulderIn, spiRaw));
    const backNeckSts = evenNumber(sts(backNeckIn, spiRaw));

    const totalRows_body = rows(bodyLenIn, rpiRaw);
    const armholeRows = rows(armholeIn, rpiRaw);
    const belowArmholeRows = totalRows_body - armholeRows;

    const instructions: ShapingInstruction[] = [];

    instructions.push({
      patternNote: `CO ${hemSts} sts. Work in 1×1 rib for 1–1.5 in, then switch to main stitch pattern. (hem)`,
      plainNote: `Cast on ${hemSts} stitches. Work knit 1, purl 1 ribbing for 1 to 1.5 inches for the hem, then switch to your main stitch.`,
    });

    if (waistShaping === 'hourglass') {
      // Hem → waist (decrease)
      const decTimesHemToWaist = (hemSts - waistSts) / 2;
      const hemToWaistRows = Math.round(belowArmholeRows * 0.45);
      const decIntervalHW = shapingInterval(hemToWaistRows, decTimesHemToWaist);

      instructions.push(decreaseInstruction(
        Math.max(0, decTimesHemToWaist),
        decIntervalHW,
        'hem to waist shaping'
      ));

      // Waist → chest (increase)
      const incTimesWaistToChest = (chestSts - waistSts) / 2;
      const waistToChestRows = belowArmholeRows - hemToWaistRows;
      const incIntervalWC = shapingInterval(waistToChestRows, incTimesWaistToChest);

      instructions.push(increaseInstruction(
        Math.max(0, incTimesWaistToChest),
        incIntervalWC,
        'waist to chest shaping'
      ));
    } else {
      instructions.push(straightInstruction(belowArmholeRows, 'body, no waist shaping'));
    }

    // Armhole
    if (config.sleeveConstruction === 'set-in') {
      const { instructions: armInstr, stitchesAfter } = setInArmhole(chestSts, armholeIn, rpiRaw, spiRaw);
      instructions.push(...armInstr);
      // Shoulder shaping
      const shoulderStsEachSide = Math.round((stitchesAfter - backNeckSts) / 2);
      instructions.push(...shoulderShaping(shoulderStsEachSide));
      instructions.push({
        patternNote: `BO rem ${backNeckSts} sts for back neck.`,
        plainNote: `Bind off the remaining ${backNeckSts} stitches across the back neck.`,
      });
    } else if (config.sleeveConstruction === 'drop-shoulder') {
      instructions.push(...dropShoulderArmhole(armholeIn, rpiRaw));
      instructions.push(...shoulderShaping(shoulderSts));
      instructions.push({
        patternNote: `BO rem ${backNeckSts} sts for back neck.`,
        plainNote: `Bind off the remaining ${backNeckSts} stitches across the back neck.`,
      });
    } else {
      // raglan
      const raglanDecTotal = Math.round((chestSts - backNeckSts) / 2);
      instructions.push({
        patternNote: `Dec 1 st each end every RS row (every 2 rows), ${raglanDecTotal} times, until ${backNeckSts} sts rem. BO all sts. (raglan shaping)`,
        plainNote: `Decrease 1 stitch at each end on every right-side row (every 2 rows), repeated ${raglanDecTotal} times, until ${backNeckSts} stitches remain. Bind off all stitches.`,
      });
    }

    pieces.push({
      name: 'Back Panel',
      castOn: hemSts,
      totalRows: totalRows_body,
      instructions,
    });
  }

  // ── FRONT PANEL(S) ──────────────────────────────────────────────────────────
  const frontLabel = config.type === 'cardigan' ? 'Front Panel (make 2, mirror image)' : 'Front Panel';
  {
    const divisor = config.type === 'cardigan' ? 2 : 1;
    const hemSts = evenNumber(sts(hemIn / divisor, spiRaw));
    const waistSts = evenNumber(sts(waistIn / divisor, spiRaw));
    const chestSts = evenNumber(sts(chestIn / divisor, spiRaw));

    const totalRows_body = rows(bodyLenIn, rpiRaw);
    const armholeRows = rows(armholeIn, rpiRaw);
    const belowArmholeRows = totalRows_body - armholeRows;

    const instructions: ShapingInstruction[] = [];

    if (config.type === 'cardigan') {
      instructions.push({
        patternNote: `CO ${hemSts} sts. Work in 1×1 rib for 1–1.5 in, then switch to main stitch. Note: add button band sts separately or pick up later. (hem)`,
        plainNote: `Cast on ${hemSts} stitches. Work ribbing for the hem. The button band can be worked as you go or picked up later — note that these are mirror-image panels.`,
      });
    } else {
      instructions.push({
        patternNote: `CO ${hemSts} sts. Work in 1×1 rib for 1–1.5 in, then switch to main stitch pattern. (hem)`,
        plainNote: `Cast on ${hemSts} stitches. Work knit 1, purl 1 ribbing for the hem, then switch to your main stitch.`,
      });
    }

    if (waistShaping === 'hourglass') {
      const decTimes = (hemSts - waistSts) / 2;
      const hemToWaistRows = Math.round(belowArmholeRows * 0.45);
      instructions.push(decreaseInstruction(Math.max(0, decTimes), shapingInterval(hemToWaistRows, decTimes), 'hem to waist'));
      const incTimes = (chestSts - waistSts) / 2;
      const waistToChestRows = belowArmholeRows - hemToWaistRows;
      instructions.push(increaseInstruction(Math.max(0, incTimes), shapingInterval(waistToChestRows, incTimes), 'waist to chest'));
    } else {
      instructions.push(straightInstruction(belowArmholeRows, 'body'));
    }

    // Armhole shaping
    if (config.sleeveConstruction === 'set-in') {
      const { instructions: armInstr, stitchesAfter } = setInArmhole(chestSts, armholeIn, rpiRaw, spiRaw);
      instructions.push(...armInstr);

      // Neck shaping (starts partway through armhole section)
      const neckInstr = necklineShaping(
        config.collar,
        stitchesAfter,
        frontNeckWidthIn / divisor,
        frontNeckDropIn,
        backNeckDropIn,
        spiRaw,
        rpiRaw
      );
      instructions.push(...neckInstr);
      instructions.push(...shoulderShaping(sts(shoulderIn, spiRaw)));
    } else if (config.sleeveConstruction === 'drop-shoulder') {
      instructions.push(...dropShoulderArmhole(armholeIn, rpiRaw));
      const neckInstr = necklineShaping(
        config.collar,
        chestSts,
        frontNeckWidthIn / divisor,
        frontNeckDropIn,
        backNeckDropIn,
        spiRaw,
        rpiRaw
      );
      instructions.push(...neckInstr);
      instructions.push(...shoulderShaping(sts(shoulderIn, spiRaw)));
    } else {
      // raglan front
      const raglanDecTotal = Math.round((chestSts - sts(frontNeckWidthIn / divisor, spiRaw)) / 2);
      instructions.push({
        patternNote: `Dec 1 st each end every RS row, ${raglanDecTotal} times. Work neck shaping simultaneously when front neck drop is reached. (raglan)`,
        plainNote: `Decrease 1 stitch at each end on every right-side row, ${raglanDecTotal} times. When you reach the neckline depth, begin neck shaping at the same time as the raglan decreases.`,
      });
    }

    pieces.push({
      name: frontLabel,
      castOn: hemSts,
      totalRows: totalRows_body,
      instructions,
    });
  }

  // ── SLEEVES ──────────────────────────────────────────────────────────────────
  if (config.type !== 'vest' && measurements.sleeveLength !== undefined) {
    const cuffIn = conv(measurements.cuffWidth ?? measurements.chestWidth * 0.25);
    const upperIn = conv(measurements.upperSleeveWidth ?? measurements.chestWidth * 0.45);
    const sleeveLen = conv(measurements.sleeveLength);
    const capHeightIn = conv(measurements.sleeveCapHeight ?? armholeIn * 0.7);

    const cuffSts = evenNumber(sts(cuffIn, spiRaw));
    const upperSts = evenNumber(sts(upperIn, spiRaw));
    const sleeveRows_total = rows(sleeveLen, rpiRaw);
    const cappedRows = config.sleeveConstruction === 'set-in' ? rows(capHeightIn, rpiRaw) : 0;
    const taperedRows = sleeveRows_total - cappedRows;

    const incTimes = (upperSts - cuffSts) / 2;
    const incInterval = shapingInterval(taperedRows, incTimes);

    const sleeveInstructions: ShapingInstruction[] = [];

    sleeveInstructions.push({
      patternNote: `CO ${cuffSts} sts. Work in 1×1 rib for 1–2 in for cuff. (cuff)`,
      plainNote: `Cast on ${cuffSts} stitches. Work knit 1, purl 1 ribbing for 1 to 2 inches for the cuff.`,
    });

    if (incTimes > 0) {
      sleeveInstructions.push(increaseInstruction(incTimes, incInterval, 'sleeve taper — cuff to upper arm'));
    } else {
      sleeveInstructions.push(straightInstruction(taperedRows, 'sleeve body (no taper needed)'));
    }

    if (config.sleeveConstruction === 'set-in') {
      sleeveInstructions.push(...setInSleeveCap(upperSts, capHeightIn, rpiRaw));
    } else if (config.sleeveConstruction === 'drop-shoulder') {
      sleeveInstructions.push({
        patternNote: `BO all ${upperSts} sts at top of sleeve. (drop shoulder — no cap shaping)`,
        plainNote: `Bind off all ${upperSts} stitches across the top. Drop shoulder sleeves don't need a shaped cap.`,
      });
    } else {
      // raglan sleeve cap
      const raglanCapDec = Math.round((upperSts - 6) / 2);
      sleeveInstructions.push({
        patternNote: `Dec 1 st each end every RS row, ${raglanCapDec} times, until 6 sts rem. BO rem sts. (raglan sleeve cap)`,
        plainNote: `Decrease 1 stitch at each end on every right-side row, ${raglanCapDec} times, until 6 stitches remain. Bind off those remaining stitches.`,
      });
    }

    pieces.push({
      name: 'Sleeves (make 2)',
      castOn: cuffSts,
      totalRows: sleeveRows_total,
      instructions: sleeveInstructions,
    });
  }

  // ── FINISHING NOTES ──────────────────────────────────────────────────────────
  const finishingNotes: string[] = [
    'Block all pieces to measurements before seaming.',
    'Seam shoulders first, then set in sleeves (if applicable), then sew side seams from hem to underarm, then sleeve seams.',
  ];
  if (config.type === 'cardigan') {
    finishingNotes.push('Pick up stitches along both front edges for button bands. Work in 1×1 rib. Mark button placement on one band before working buttonholes on the other.');
  }
  if (config.collar === 'turtleneck') {
    finishingNotes.push(`Pick up neck stitches and work in 1×1 rib for ${collarHeightIn > 0 ? collarHeightIn.toFixed(1) : '4–6'} inches for turtleneck. Bind off loosely.`);
  }

  const yarnEstimate = gauge.gramsPerSqIn
    ? estimateYarn(gauge.gramsPerSqIn, config, measurements, unit)
    : undefined;

  return {
    gauge: { stitchesPerInch: spiRaw, rowsPerInch: rpiRaw },
    waistShaping,
    pieces,
    finishingNotes,
    yarnEstimate,
  };
}
