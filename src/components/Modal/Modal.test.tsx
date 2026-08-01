import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Modal from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the title, children and close button when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Delete User" showCloseButton>
        Are you sure?
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('uses the title as the dialog aria-label', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Delete User">
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Delete User');
  });

  it('falls back to a default aria-label when no title is given', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Modal');
  });

  it('does not render the header when there is no title and no close button', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('renders the header when only showCloseButton is true', () => {
    render(
      <Modal isOpen onClose={vi.fn()} showCloseButton>
        Content
      </Modal>
    );

    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('applies the given maxWidth as an inline style', () => {
    render(
      <Modal isOpen onClose={vi.fn()} maxWidth="20rem">
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '20rem' });
  });

  it('applies the given zIndex to the overlay', () => {
    render(
      <Modal isOpen onClose={vi.fn()} zIndex={1500}>
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement).toHaveStyle({ zIndex: 1500 });
  });

  it('merges a custom className into the modal container', () => {
    render(
      <Modal isOpen onClose={vi.fn()} className="custom-modal">
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} showCloseButton>
        Content
      </Modal>
    );

    await user.click(screen.getByLabelText('Close modal'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay is clicked and closeOnOverlayClick is true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} closeOnOverlayClick>
        Content
      </Modal>
    );

    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the overlay is clicked and closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} closeOnOverlayClick={false}>
        Content
      </Modal>
    );

    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );

    await user.click(screen.getByText('Content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Escape key is pressed while open', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for other keys', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not listen for Escape when closed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={false} onClose={onClose}>
        Content
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender, unmount } = render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('');

    unmount();
  });

  it('focuses the modal container when opened', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('applies the centered class by default', () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement?.className).toMatch(/centered/);
  });

  it('applies the top-aligned class when centered is false', () => {
    render(
      <Modal isOpen onClose={vi.fn()} centered={false}>
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement?.className).toMatch(/topAligned/);
  });

  it('merges a custom overlayClassName into the overlay', () => {
    render(
      <Modal isOpen onClose={vi.fn()} overlayClassName="custom-overlay">
        Content
      </Modal>
    );

    expect(screen.getByRole('dialog').parentElement).toHaveClass('custom-overlay');
  });
});
