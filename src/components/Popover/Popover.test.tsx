import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Popover from './Popover';

/**
 * jsdom doesn't implement the imperative Popover API (showPopover/toggle events
 * aren't dispatched natively), so open/close is exercised by dispatching a
 * synthetic `toggle` event — the same event our positioning/callback logic listens for.
 */
function dispatchToggle(target: Element, newState: 'open' | 'closed') {
  const event = new Event('toggle');

  Object.defineProperty(event, 'newState', { value: newState });

  fireEvent(target, event);
}

describe('Popover', () => {
  it('links the trigger to the panel via popoverTarget/id', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Content</p>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    expect(trigger).toHaveAttribute('popovertarget', panel.id);
    expect(trigger).toHaveAttribute('popovertargetaction', 'toggle');
  });

  it('renders children inside the panel', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Popover body</p>
      </Popover>
    );

    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('sets popover="auto" on the panel', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Content</p>
      </Popover>
    );

    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    expect(panel).toHaveAttribute('popover', 'auto');
  });

  it('merges a custom className into the panel', () => {
    render(
      <Popover trigger={<button>Open</button>} className="custom-panel">
        <p>Content</p>
      </Popover>
    );

    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    expect(panel).toHaveClass('custom-panel');
  });

  it('respects a custom id', () => {
    render(
      <Popover trigger={<button>Open</button>} id="my-popover">
        <p>Content</p>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });

    expect(trigger).toHaveAttribute('popovertarget', 'my-popover');
    expect(document.getElementById('my-popover')).toBeInTheDocument();
  });

  it('calls onOpenChange(true) when the panel toggles open', () => {
    const onOpenChange = vi.fn();

    render(
      <Popover trigger={<button>Open</button>} onOpenChange={onOpenChange}>
        <p>Content</p>
      </Popover>
    );

    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    dispatchToggle(panel, 'open');

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls onOpenChange(false) when the panel toggles closed', () => {
    const onOpenChange = vi.fn();

    render(
      <Popover trigger={<button>Open</button>} onOpenChange={onOpenChange}>
        <p>Content</p>
      </Popover>
    );

    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    dispatchToggle(panel, 'open');
    dispatchToggle(panel, 'closed');

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('applies computed inline position styles once opened', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Content</p>
      </Popover>
    );

    const panel = screen.getByText('Content').closest('[popover]') as HTMLElement;

    dispatchToggle(panel, 'open');

    expect(panel.style.top).not.toBe('');
    expect(panel.style.left).not.toBe('');
  });
});
