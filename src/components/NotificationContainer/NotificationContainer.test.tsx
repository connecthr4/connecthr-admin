import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationContainer, { type Notification } from './NotificationContainer';
import styles from './NotificationContainer.module.scss';

const baseNotification: Notification = {
  id: 1,
  type: 'success',
  title: 'Saved',
  message: 'Your changes were saved.',
};

describe('NotificationContainer', () => {
  it('renders the container with no notifications', () => {
    render(<NotificationContainer notifications={[]} removeNotification={vi.fn()} />);

    expect(screen.getByTestId('NotificationContainerTest')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders each notification with its title and message', () => {
    const notifications: Notification[] = [
      baseNotification,
      { id: 2, type: 'error', title: 'Failed', message: 'Something went wrong.' },
    ];
    render(<NotificationContainer notifications={notifications} removeNotification={vi.fn()} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it.each([
    ['success', 'lucide-circle-check', styles.successTitle],
    ['error', 'lucide-circle-x', styles.errorTitle],
    ['warning', 'lucide-triangle-alert', styles.warningTitle],
    ['info', 'lucide-info', styles.infoTitle],
  ] as const)('renders the %s type with its own icon and title style', (type, iconClass, titleClass) => {
    const { container } = render(
      <NotificationContainer notifications={[{ ...baseNotification, type }]} removeNotification={vi.fn()} />
    );

    expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument();
    expect(screen.getByText('Saved')).toHaveClass(titleClass);
    expect(container.querySelector(`.${styles.notification}`)).toHaveClass(styles[type]);
  });

  it('groups notifications under their position, defaulting to top-right', () => {
    const notifications: Notification[] = [
      baseNotification,
      { id: 2, type: 'info', title: 'Heads up', message: 'Bottom left', position: 'bottom-left' },
    ];
    const { container } = render(<NotificationContainer notifications={notifications} removeNotification={vi.fn()} />);

    const topRight = container.querySelector(`.${styles['top-right']}`) as HTMLElement;
    const bottomLeft = container.querySelector(`.${styles['bottom-left']}`) as HTMLElement;

    expect(topRight).toContainElement(screen.getByText('Saved'));
    expect(bottomLeft).toContainElement(screen.getByText('Heads up'));
    expect(topRight).not.toContainElement(screen.getByText('Heads up'));
  });

  it('removes a notification when its close icon is clicked', async () => {
    const user = userEvent.setup();
    const removeNotification = vi.fn();
    const { container } = render(
      <NotificationContainer notifications={[baseNotification]} removeNotification={removeNotification} />
    );

    await user.click(container.querySelector(`.${styles.notificationClose}`) as SVGElement);

    expect(removeNotification).toHaveBeenCalledWith(1);
  });

  it('shows the progress bar only when both showProgress and a duration are set', () => {
    const { rerender } = render(
      <NotificationContainer
        notifications={[{ ...baseNotification, duration: 3000, showProgress: true }]}
        removeNotification={vi.fn()}
      />
    );

    expect(screen.getByTestId('progress-bar')).toHaveStyle({ animationDuration: '3000ms' });

    rerender(
      <NotificationContainer
        notifications={[{ ...baseNotification, showProgress: true }]}
        removeNotification={vi.fn()}
      />
    );

    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  describe('auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('removes a notification once its duration has elapsed', () => {
      const removeNotification = vi.fn();
      render(
        <NotificationContainer
          notifications={[{ ...baseNotification, duration: 2000 }]}
          removeNotification={removeNotification}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(removeNotification).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(removeNotification).toHaveBeenCalledWith(1);
    });

    it('never auto-dismisses a notification without a duration', () => {
      const removeNotification = vi.fn();
      render(<NotificationContainer notifications={[baseNotification]} removeNotification={removeNotification} />);

      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(removeNotification).not.toHaveBeenCalled();
    });

    it('clears pending timers when the notification is removed before it fires', () => {
      const removeNotification = vi.fn();
      const { rerender } = render(
        <NotificationContainer
          notifications={[{ ...baseNotification, duration: 2000 }]}
          removeNotification={removeNotification}
        />
      );

      rerender(<NotificationContainer notifications={[]} removeNotification={removeNotification} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(removeNotification).not.toHaveBeenCalled();
    });
  });
});
