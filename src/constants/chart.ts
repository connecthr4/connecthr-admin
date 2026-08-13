/**
 * Shared chart theming values. Kept out of the SCSS modules because Recharts
 * paints SVG marks through props, not classes.
 */

/**
 * Categorical palette used to colour series that arrive from the API without
 * colours of their own (departments, statuses, and so on).
 *
 * The order is deliberate, not decorative: these eight hues were validated
 * against the white chart surface for colour-blind separation (worst adjacent
 * pair ΔE 9.1 for protanopia), a common lightness band, and a chroma floor, so
 * neighbouring slices stay distinguishable. Reordering or dropping a hue
 * invalidates that, so extend at the end rather than in the middle.
 */
export const CATEGORICAL_CHART_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const;

/**
 * Surface the charts are painted on — also the gap colour drawn between
 * adjacent slices so two similar hues never touch.
 */
export const CHART_SURFACE_COLOR = '#ffffff';

/**
 * Width of that gap, in pixels.
 */
export const CHART_SLICE_GAP = 2;
