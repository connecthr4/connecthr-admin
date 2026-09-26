/**
 * The breakpoint scale from `src/styles/_mixins.scss`, for the few places script has
 * to agree with the stylesheets. Layout itself stays in CSS — reach for these only
 * when behaviour, not appearance, changes at a breakpoint. Change both files together.
 *
 * Each value is the inclusive top of its tier, as in the Sass map.
 */
export const BREAKPOINTS = {
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1440,
} as const;

/**
 * Matches while the sidebar is docked beside the content — the complement of
 * `respond(md)`, below which it becomes a drawer.
 */
export const DOCKED_NAV_QUERY = `(width > ${BREAKPOINTS.md}px)`;
