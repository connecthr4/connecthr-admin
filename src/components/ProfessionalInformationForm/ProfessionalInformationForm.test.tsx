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
  shiftCode: 'GENERAL',
};

/**
 * The shifts as `/shifts` lists them: the dropdown stores the `code` and shows the `name`.
 */
const shiftOptions = [
  { label: 'General Shift', value: 'GENERAL' },
  { label: 'Night Shift', value: 'NIGHT' },
];

/**
 * The departments as `/options/employee/department` serves them — the label is also the
 * value, since that is the display text the create endpoint stores.
 */
const departmentOptions = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Finance', value: 'Finance' },
];

/**
 * The form reads its default values from the employee store, so a step is set up by seeding
 * the store rather than by passing props. The shift and department lists are what it does
 * take as props, so the step can be exercised without the backend.
 */
const renderForm = (professionalInformation?: Partial<ProfessionalInformationDraft>) => {
  if (professionalInformation) {
    useEmployeeStore.getState().setProfessionalInformation(professionalInformation);
  }

  const onSubmit = vi.fn();
  const loadShiftOptions = vi.fn(() => Promise.resolve(shiftOptions));
  const loadDepartmentOptions = vi.fn(() => Promise.resolve(departmentOptions));

  render(
    <ProfessionalInformationForm
      onSubmit={onSubmit}
      loadShiftOptions={loadShiftOptions}
      loadDepartmentOptions={loadDepartmentOptions}
      footer={<button type="submit">Next</button>}
    />
  );

  return { onSubmit, loadShiftOptions, loadDepartmentOptions, user: userEvent.setup() };
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

  it('renders every field of the step, restoring the values held in the store', async () => {
    renderForm(filledProfessionalInformation);

    expect(screen.getByPlaceholderText('Enter Employee ID')).toHaveValue('EMP001');
    expect(screen.getByRole('button', { name: 'Full Time' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByText('Date of Joining')).toBeInTheDocument();

    // Both lists are fetched, so a stored selection only shows once the list holding it has
    // arrived — and the shift, being a code, only reads as a name from then on.
    expect(await screen.findByRole('button', { name: 'Engineering' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'General Shift' })).toBeInTheDocument();
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
    expect(screen.getByText('Shift is required')).toBeInTheDocument();

    // Employee ID is optional, and Employment Status is seeded by the store.
    expect(screen.queryByText('Employment Status is required')).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the picked values once every required field is filled', async () => {
    const { onSubmit, user } = renderForm({
      ...filledProfessionalInformation,
      employeeType: '',
      department: '',
      shiftCode: '',
    });

    await selectOption(user, 'Select Employee Type', 'Full Time');
    await selectOption(user, 'Select Department', 'Engineering');
    await selectOption(user, 'Select Shift', 'Night Shift');

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
      // The picked shift travels as the code the backend stores, not as the name shown.
      shiftCode: 'NIGHT',
    });
  });

  it('drops a stored shift the backend no longer offers', async () => {
    const { loadShiftOptions, user } = renderForm({ ...filledProfessionalInformation, shiftCode: 'RETIRED' });

    await waitFor(() => expect(loadShiftOptions).toHaveBeenCalled());

    // Nothing in the fetched list matches the stored code, so the field falls back to its
    // placeholder rather than showing a shift the step could not be submitted with.
    expect(await screen.findByRole('button', { name: 'Select Shift' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(screen.getByText('Shift is required')).toBeInTheDocument());
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
