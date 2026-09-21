import { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Drawer from './Drawer';

/**
 * The dialog is always in the DOM — the `open` attribute is what tells it apart, exactly as the
 * browser uses it to decide whether to render the panel and the backdrop.
 */
const getDialog = () => screen.getByTestId('DrawerTest');

describe('Drawer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays closed and renders no content when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Filters">
        Content
      </Drawer>
    );

    expect(getDialog()).not.toHaveAttribute('open');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('opens as a modal and renders the title, children and close button', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} title="Filters">
        Content
      </Drawer>
    );

    expect(getDialog()).toHaveAttribute('open');
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });

  it('names the dialog with its title, and falls back to ariaLabel without one', () => {
    const { rerender } = render(
      <Drawer isOpen onClose={vi.fn()} title="Filters">
        Content
      </Drawer>
    );

    const titleId = screen.getByRole('heading', { name: 'Filters' }).id;

    expect(getDialog()).toHaveAttribute('aria-labelledby', titleId);
    expect(getDialog()).not.toHaveAttribute('aria-label');

    rerender(
      <Drawer isOpen onClose={vi.fn()} ariaLabel="Employee details">
        Content
      </Drawer>
    );

    expect(getDialog()).toHaveAttribute('aria-label', 'Employee details');
  });

  it('closes from the close button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer isOpen onClose={onClose}>
        Content
      </Drawer>
    );

    await user.click(screen.getByRole('button', { name: 'Close drawer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the close button when showCloseButton is false', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} showCloseButton={false} title="Filters">
        Content
      </Drawer>
    );

    expect(screen.queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('closes on Escape without letting the browser close the dialog itself', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer isOpen onClose={onClose}>
        Content
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
    // The parent owns `isOpen`, so the dialog must stay open until it says otherwise.
    expect(getDialog()).toHaveAttribute('open');
  });

  it('ignores Escape when closeOnEsc is false', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer isOpen onClose={onClose} closeOnEsc={false}>
        Content
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when the overlay is pressed and released', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose}>
        Content
      </Drawer>
    );

    fireEvent.mouseDown(getDialog());
    fireEvent.click(getDialog());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores overlay clicks when closeOnOverlayClick is false', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose} closeOnOverlayClick={false}>
        Content
      </Drawer>
    );

    fireEvent.mouseDown(getDialog());
    fireEvent.click(getDialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when a drag starts inside the panel and ends on the overlay', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose}>
        Content
      </Drawer>
    );

    fireEvent.mouseDown(screen.getByText('Content'));
    // The click is reported against the dialog, because that is the common ancestor.
    fireEvent.click(getDialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when a form inside the body submits with method="dialog"', () => {
    const onClose = vi.fn();

    render(
      <Drawer isOpen onClose={onClose}>
        Content
      </Drawer>
    );

    act(() => {
      (getDialog() as HTMLDialogElement).close('confirmed');
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies the placement and size to the panel', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} placement="bottom" size="18rem" transitionDuration={120}>
        Content
      </Drawer>
    );

    const dialog = getDialog();

    expect(dialog).toHaveAttribute('data-placement', 'bottom');
    expect(dialog.style.getPropertyValue('--drawer-size')).toBe('18rem');
    expect(dialog.style.getPropertyValue('--drawer-duration')).toBe('120ms');
  });

  it('renders footer content outside the scrollable body', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} footer={<button type="button">Apply</button>}>
        Content
      </Drawer>
    );

    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('locks page scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Drawer isOpen onClose={vi.fn()}>
        Content
      </Drawer>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Drawer isOpen={false} onClose={vi.fn()}>
        Content
      </Drawer>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('leaves page scroll alone when lockScroll is false', () => {
    render(
      <Drawer isOpen onClose={vi.fn()} lockScroll={false}>
        Content
      </Drawer>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('keeps content mounted until the closing animation finishes, then unmounts it', () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <Drawer isOpen onClose={vi.fn()} transitionDuration={300}>
        Content
      </Drawer>
    );

    rerender(
      <Drawer isOpen={false} onClose={vi.fn()} transitionDuration={300}>
        Content
      </Drawer>
    );

    // Still on screen while the panel slides away.
    expect(screen.getByText('Content')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('keeps content mounted after closing when unmountOnClose is false', () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <Drawer isOpen={false} onClose={vi.fn()} unmountOnClose={false}>
        Content
      </Drawer>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();

    rerender(
      <Drawer isOpen onClose={vi.fn()} unmountOnClose={false}>
        Content
      </Drawer>
    );

    rerender(
      <Drawer isOpen={false} onClose={vi.fn()} unmountOnClose={false}>
        Content
      </Drawer>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('moves focus to initialFocusRef when the drawer opens', () => {
    function Harness() {
      const inputRef = useRef<HTMLInputElement>(null);

      return (
        <Drawer isOpen onClose={vi.fn()} initialFocusRef={inputRef}>
          <input ref={inputRef} aria-label="Search" />
        </Drawer>
      );
    }

    render(<Harness />);

    expect(screen.getByLabelText('Search')).toHaveFocus();
  });
});
