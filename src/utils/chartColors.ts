import { CATEGORICAL_CHART_COLORS } from '../constants/chart';

/**
 * Rotating the hue by the golden angle keeps every generated colour as far as
 * possible from the ones already handed out, however many are asked for.
 */
const GOLDEN_ANGLE = 137.508;

/**
 * Offset of the first generated hue, picked so it does not land on top of a
 * colour that is already in {@link CATEGORICAL_CHART_COLORS}.
 */
const OVERFLOW_BASE_HUE = 24;

/**
 * Generated colours alternate between a deep and a light step, which separates
 * neighbouring hues by lightness as well as by hue.
 */
const OVERFLOW_SATURATION = [62, 70];
const OVERFLOW_LIGHTNESS = [44, 50];

/**
 * Yellow-green reads much lighter than blue at the same HSL lightness, so pull
 * that part of the wheel down to keep every generated colour in one perceived
 * lightness band.
 */
const YELLOW_GREEN_HUE = 90;
const MAX_LIGHTNESS_DROP = 12;

/**
 * Generated colours never change for a given slot, so they are computed once
 * and reused for the life of the page.
 */
const generatedColorCache = new Map<number, string>();

/**
 * Converts an HSL triplet to the hex string Recharts expects.
 */
function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;

  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));

    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Builds a colour for a slot the curated palette does not cover.
 */
function generateChartColor(slot: number): string {
  const cached = generatedColorCache.get(slot);

  if (cached) return cached;

  const overflowIndex = slot - CATEGORICAL_CHART_COLORS.length;
  const hue = (OVERFLOW_BASE_HUE + (overflowIndex + 1) * GOLDEN_ANGLE) % 360;
  const step = overflowIndex % 2;

  const lightnessDrop = MAX_LIGHTNESS_DROP * Math.max(0, Math.cos(((hue - YELLOW_GREEN_HUE) * Math.PI) / 180));
  const color = hslToHex(hue, OVERFLOW_SATURATION[step], OVERFLOW_LIGHTNESS[step] - lightnessDrop);

  generatedColorCache.set(slot, color);

  return color;
}

/**
 * Resolves the colour for a slot: the curated palette first, then a generated
 * hue for anything beyond it. Deterministic — the same slot always gets the
 * same colour, so the chart does not flicker between renders.
 */
export function getChartColor(slot: number): string {
  return CATEGORICAL_CHART_COLORS[slot] ?? generateChartColor(slot);
}

/**
 * Attaches a colour to every entry of an API series that has none.
 *
 * Slots are handed out in alphabetical order of `name` rather than in the
 * order the API sends, so a department keeps its colour when headcounts change
 * and the backend re-sorts the list. An entry that already carries a colour is
 * left alone.
 */
export function withChartColors<T extends { name: string; color?: string }>(
  data: readonly T[]
): Array<T & { color: string }> {
  const slotByName = new Map(
    [...data].sort((first, second) => first.name.localeCompare(second.name)).map(({ name }, slot) => [name, slot])
  );

  return data.map((entry) => ({
    ...entry,
    color: entry.color ?? getChartColor(slotByName.get(entry.name) ?? 0),
  }));
}
