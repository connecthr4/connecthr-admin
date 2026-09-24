import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DeleteConfirmationModal from './DeleteConfirmationModal';
import { STRINGS } from '@/src/constants/strings';

describe('DeleteConfirmationModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  const description = STRINGS.DELETE_USER_CONFIRMATION;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <DeleteConfirmationModal isOpen={false} onClose={onClose} onConfirm={onConfirm} description={description} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the default title, the caller description, and the actions when open', () => {
    render(<DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: STRINGS.DELETE })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.CANCEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.DELETE })).toBeInTheDocument();
  });

  it('lets the caller override the title and the confirm label', () => {
    render(
      <DeleteConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        description={description}
        title={STRINGS.DELETE_USER}
        confirmLabel="Remove account"
      />
    );

    expect(screen.getByRole('heading', { name: STRINGS.DELETE_USER })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: STRINGS.DELETE })).not.toBeInTheDocument();
  });

  it('renders caller-supplied content under the description', () => {
    render(
      <DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description}>
        <span>Priya Nair</span>
      </DeleteConfirmationModal>
    );

    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    await user.click(screen.getByRole('button', { name: STRINGS.DELETE }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  /*
  There is no undo, so a second click on a delete already in flight must not
  land — nor must any of the ways out of the modal, which would leave the
  caller unsure whether the delete went through.
  */
  it('disables both actions while the delete is in flight', async () => {
    const user = userEvent.setup();
    render(
      <DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} isDeleting />
    );

    const cancelButton = screen.getByRole('button', { name: STRINGS.CANCEL });
    const confirmButton = screen.getByRole('button', { name: STRINGS.DELETE });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    await user.click(confirmButton);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not close on escape while the delete is in flight', async () => {
    const user = userEvent.setup();
    render(
      <DeleteConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} isDeleting />
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});
