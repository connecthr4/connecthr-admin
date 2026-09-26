import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorScreen from './ErrorScreen';
import { STRINGS } from '@/src/constants/strings';

describe('ErrorScreen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('says what happened without leaking anything about the failure', () => {
    render(<ErrorScreen onRetry={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(STRINGS.ERROR_TITLE);
    expect(screen.getByText(STRINGS.ERROR_DESCRIPTION)).toBeInTheDocument();
  });

  it('retries the failed render without reloading the page', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorScreen onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ERROR_TRY_AGAIN }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('reloads the page from the secondary action', async () => {
    /*
    jsdom's `location.reload` is a no-op that warns; the button only has to be shown to call
    it, so the method is replaced outright.
    */
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    });

    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorScreen onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: STRINGS.ERROR_RELOAD_PAGE }));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });
});
