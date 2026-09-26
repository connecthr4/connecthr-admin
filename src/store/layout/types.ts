export interface LayoutState {
  /**
   * Whether the navigation drawer is open. Only meaningful at tablet widths —
   * above `md` the sidebar is docked and there is no drawer to open.
   */
  isNavOpen: boolean;

  openNav: () => void;
  closeNav: () => void;
}
