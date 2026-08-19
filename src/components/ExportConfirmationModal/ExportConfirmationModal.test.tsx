import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExportConfirmationModal from './ExportConfirmationModal';
import { STRINGS } from '@/src/constants/strings';

describe('ExportConfirmationModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  const description = STRINGS.EXPORT_HOLIDAYS_CONFIRMATION;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <ExportConfirmationModal isOpen={false} onClose={onClose} onConfirm={onConfirm} description={description} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the default title, the caller description, and the actions when open', () => {
    render(<ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.CANCEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STRINGS.DOWNLOAD })).toBeInTheDocument();
  });

  it('lets the caller override the title and the confirm label', () => {
    render(
      <ExportConfirmationModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        description={description}
        title="Export Employees"
        confirmLabel="Export"
      />
    );

    expect(screen.getByText('Export Employees')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: STRINGS.DOWNLOAD })).not.toBeInTheDocument();
  });

  it('renders caller-supplied content under the description', () => {
    render(
      <ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description}>
        <span>scope options</span>
      </ExportConfirmationModal>
    );

    expect(screen.getByText('scope options')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    await user.click(screen.getByRole('button', { name: STRINGS.DOWNLOAD }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CANCEL }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables both actions while the export is in flight', async () => {
    const user = userEvent.setup();
    render(
      <ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} isExporting />
    );

    const cancelButton = screen.getByRole('button', { name: STRINGS.CANCEL });
    const confirmButton = screen.getByRole('button', { name: STRINGS.DOWNLOAD });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    await user.click(confirmButton);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not close on escape while the export is in flight', async () => {
    const user = userEvent.setup();
    render(
      <ExportConfirmationModal isOpen onClose={onClose} onConfirm={onConfirm} description={description} isExporting />
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});
