import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import NavMenuButton from './NavMenuButton';
import { STRINGS } from '@/src/constants/strings';
import { useLayoutStore } from '@/src/store/layout';

/*
The button is `display: none` until the tablet breakpoint, and jsdom has no viewport
for that media query to match. A hidden element has no computed accessible name, so it
is found by role alone and its label asserted as an attribute instead.
*/
const getButton = () => screen.getByRole('button', { hidden: true });

describe('NavMenuButton', () => {
  beforeEach(() => {
    useLayoutStore.setState({ isNavOpen: false });
  });

  it('renders an accessibly named button', () => {
    render(<NavMenuButton />);

    expect(getButton()).toHaveAttribute('aria-label', STRINGS.OPEN_NAVIGATION_MENU);
    expect(getButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the navigation drawer', async () => {
    render(<NavMenuButton />);

    await userEvent.click(getButton());

    expect(useLayoutStore.getState().isNavOpen).toBe(true);
    expect(getButton()).toHaveAttribute('aria-expanded', 'true');
  });
});
