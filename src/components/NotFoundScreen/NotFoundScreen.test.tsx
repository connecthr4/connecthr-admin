import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotFoundScreen from './NotFoundScreen';
import { ROUTES, STRINGS } from '@/src/constants/strings';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}));

/**
 * `history.length` is read to decide whether there is anywhere to go back to. jsdom starts
 * every test at 1 and offers no way to push entries, so it is stubbed per test instead.
 */
function setHistoryLength(length: number) {
  vi.spyOn(window.history, 'length', 'get').mockReturnValue(length);
}

describe('NotFoundScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockClear();
    backMock.mockClear();
  });

  it('names the error in the heading and repeats the code for support', () => {
    render(<NotFoundScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(STRINGS.NOT_FOUND_TITLE);
    expect(screen.getByText(STRINGS.NOT_FOUND_CODE)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.NOT_FOUND_SUPPORT_NOTE)).toBeInTheDocument();
  });

  it('offers exactly the two ways out, and no other control', () => {
    render(<NotFoundScreen />);

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('steps back through history when there is something behind this screen', async () => {
    setHistoryLength(3);
    const user = userEvent.setup();
    render(<NotFoundScreen />);

    await user.click(screen.getByRole('button', { name: STRINGS.NOT_FOUND_GO_BACK }));

    expect(backMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('falls back to the dashboard when the screen was opened directly', async () => {
    setHistoryLength(1);
    const user = userEvent.setup();
    render(<NotFoundScreen />);

    await user.click(screen.getByRole('button', { name: STRINGS.NOT_FOUND_GO_BACK }));

    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('sends the dashboard button to the dashboard', async () => {
    const user = userEvent.setup();
    render(<NotFoundScreen />);

    await user.click(screen.getByRole('button', { name: STRINGS.NOT_FOUND_BACK_TO_DASHBOARD }));

    expect(pushMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('keeps the illustration out of the accessibility tree', () => {
    const { container } = render(<NotFoundScreen />);

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
