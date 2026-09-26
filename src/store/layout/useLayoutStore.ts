/**
 * store responsible for app-shell UI state shared between components that sit in
 * different parts of the tree — the header's menu button and the sidebar drawer it opens.
 *
 */

import { create } from 'zustand';
import { LayoutState } from './types';

export const useLayoutStore = create<LayoutState>((set) => ({
  isNavOpen: false,

  openNav: () =>
    set({
      isNavOpen: true,
    }),

  closeNav: () =>
    set({
      isNavOpen: false,
    }),
}));
