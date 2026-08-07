import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProfessionalInformationForm from './ProfessionalInformationForm';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { ProfessionalInformationDraft } from '@/src/store/employeeStore/types';

const filledProfessionalInformation: ProfessionalInformationDraft = {
  employeeID: 'EMP001',
  employeeType: 'Full Time',
  employmentStatus: 'Active',
  dateOfJoining: '2024-03-18',
  department: 'Engineering',
};

/**
 * The form reads its default values from the employee store, so a step is set up by seeding
 * the store rather than by passing props.
 */
const renderForm = (professionalInformation?: Partial<ProfessionalInformationDraft>) => {
  if (professionalInformation) {
    useEmployeeStore.getState().setProfessionalInformation(professionalInformation);
  }

  const onSubmit = vi.fn();

  render(<ProfessionalInformationForm onSubmit={onSubmit} footer={<button type="submit">Next</button>} />);

  return { onSubmit, user: userEvent.setup() };
};

const selectOption = async (user: ReturnType<typeof userEvent.setup>, trigger: string, option: string) => {
  await user.click(screen.getByRole('button', { name: trigger }));
  await user.click(await screen.findByRole('button', { name: option }));
};

describe('ProfessionalInformationForm', () => {
  afterEach(() => {
    // The store is a module-level singleton, and it seeds the form's default values.
    useEmployeeStore.getState().resetEmployeeData();
  });

  it('renders every field of the step, restoring the values held in the store', () => {
    renderForm(filledProfessionalInformation);

    expect(screen.getByPlaceholderText('Enter Employee ID')).toHaveValue('EMP001');
    expect(screen.getByRole('button', { name: 'Full Time' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.getByText('Date of Joining')).toBeInTheDocument();
  });

  it('locks the fields the user does not own', () => {
    renderForm(filledProfessionalInformation);

    // Employee ID is assigned by the backend, and a new joiner is always created Active.
    expect(screen.getByPlaceholderText('Enter Employee ID')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Active' })).toBeDisabled();
  });

  it('shows an inline message for every unfilled required field on submit', async () => {
    const { onSubmit, user } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(screen.getByText('Employee Type is required')).toBeInTheDocument();
    });

    expect(screen.getByText('Date of Joining is required')).toBeInTheDocument();
    expect(screen.getByText('Department is required')).toBeInTheDocument();

    // Employee ID is optional, and Employment Status is seeded by the store.
    expect(screen.queryByText('Employment Status is required')).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the picked values once every required field is filled', async () => {
    const { onSubmit, user } = renderForm({ ...filledProfessionalInformation, employeeType: '', department: '' });

    await selectOption(user, 'Select Employee Type', 'Full Time');
    await selectOption(user, 'Select Department', 'Engineering');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      employeeID: 'EMP001',
      employeeType: 'Full Time',
      employmentStatus: 'Active',
      dateOfJoining: '2024-03-18',
      department: 'Engineering',
    });
  });

  it('keeps a dropdown selection after it is changed', async () => {
    const { user } = renderForm();

    await selectOption(user, 'Select Employee Type', 'Full Time');

    expect(screen.getByRole('button', { name: 'Full Time' })).toBeInTheDocument();

    await selectOption(user, 'Full Time', 'Contract');

    expect(screen.getByRole('button', { name: 'Contract' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select Employee Type' })).not.toBeInTheDocument();
  });
});
