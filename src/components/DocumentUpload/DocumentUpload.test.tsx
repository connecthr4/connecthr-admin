import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DocumentUpload from './DocumentUpload';
import { DOCUMENT_FIELDS, STRINGS } from '@/src/constants/strings';
import { useEmployeeStore } from '@/src/store/employeeStore';

describe('DocumentUpload', () => {
  const onSubmit = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // The store is a module singleton, so a file left by one test would leak into the next.
    useEmployeeStore.getState().resetEmployeeData();
  });

  it('renders an upload field for every document', () => {
    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} />);

    DOCUMENT_FIELDS.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('keeps a picked file in the store and shows it', async () => {
    const user = userEvent.setup();
    const file = new File(['letter'], 'appointment-letter.pdf', { type: 'application/pdf' });

    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} />);

    await user.upload(screen.getByLabelText(STRINGS.UPLOAD_APPOINTMENT_LETTER), file);

    expect(useEmployeeStore.getState().documents.appointmentLetter).toBe(file);
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });

  it('restores a file the store is already holding', () => {
    const file = new File(['slips'], 'salary-slips.pdf', { type: 'application/pdf' });

    useEmployeeStore.getState().setDocument('salarySlips', file);

    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} />);

    expect(screen.getByText(file.name)).toBeInTheDocument();
  });

  it('drops a removed file from the store', async () => {
    const user = userEvent.setup();
    const file = new File(['letter'], 'experience-letter.pdf', { type: 'application/pdf' });

    useEmployeeStore.getState().setDocument('experienceLetter', file);

    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: `${STRINGS.REMOVE} ${STRINGS.UPLOAD_EXPERIENCE_LETTER}` }));

    expect(useEmployeeStore.getState().documents.experienceLetter).toBeNull();
  });

  it('submits the step and steps back', async () => {
    const user = userEvent.setup();

    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} submitLabel={STRINGS.CREATE_EMPLOYEE} />);

    await user.click(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE }));
    expect(onSubmit).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('locks both actions while the employee is being saved', () => {
    render(<DocumentUpload onSubmit={onSubmit} onBack={onBack} submitLabel={STRINGS.CREATE_EMPLOYEE} isSubmitting />);

    expect(screen.getByRole('button', { name: STRINGS.CREATE_EMPLOYEE })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByLabelText(STRINGS.UPLOAD_APPOINTMENT_LETTER)).toBeDisabled();
  });
});
