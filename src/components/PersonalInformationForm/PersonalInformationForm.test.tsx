import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PersonalInformationForm from './PersonalInformationForm';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { DropdownOption } from '../Dropdown/Dropdown';

const stateOptions: DropdownOption[] = [
  { label: 'Karnataka', value: 'KA' },
  { label: 'Tamil Nadu', value: 'TN' },
];

const districtOptionsByState: Record<string, DropdownOption[]> = {
  KA: [{ label: 'Bengaluru Urban', value: '525' }],
  TN: [{ label: 'Chennai', value: '568' }],
};

const genderOptions: DropdownOption[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const maritalStatusOptions: DropdownOption[] = [
  { label: 'Single', value: 'Single' },
  { label: 'Married', value: 'Married' },
];

/**
 * Every dropdown here is fed from the backend in the app — the address pair, plus Gender and
 * Marital Status; the loaders are injected so the form can be exercised without one.
 */
const renderForm = () => {
  const loadDistrictOptions = vi.fn((stateCode: string) => Promise.resolve(districtOptionsByState[stateCode] ?? []));
  const loadGenderOptions = vi.fn(() => Promise.resolve(genderOptions));

  render(
    <PersonalInformationForm
      onSubmit={vi.fn()}
      loadStateOptions={() => Promise.resolve(stateOptions)}
      loadDistrictOptions={loadDistrictOptions}
      loadGenderOptions={loadGenderOptions}
      loadMaritalStatusOptions={() => Promise.resolve(maritalStatusOptions)}
    />
  );

  return { loadDistrictOptions, loadGenderOptions, user: userEvent.setup() };
};

const selectOption = async (user: ReturnType<typeof userEvent.setup>, trigger: HTMLElement, option: string) => {
  await user.click(trigger);
  await user.click(await screen.findByRole('button', { name: option }));
};

describe('PersonalInformationForm', () => {
  afterEach(() => {
    // The store is a module-level singleton, and it seeds the form's default values.
    useEmployeeStore.getState().resetEmployeeData();
  });

  it('loads the districts of the selected state, and keeps the district locked until then', async () => {
    const { loadDistrictOptions, user } = renderForm();

    const districtTrigger = screen.getByRole('button', { name: 'Select Current District' });

    expect(districtTrigger).toBeDisabled();
    expect(loadDistrictOptions).not.toHaveBeenCalled();

    await selectOption(user, screen.getByRole('button', { name: 'Select Current State' }), 'Karnataka');

    await waitFor(() => expect(districtTrigger).toBeEnabled());

    expect(loadDistrictOptions).toHaveBeenCalledWith('KA');

    await user.click(districtTrigger);

    expect(await screen.findByRole('button', { name: 'Bengaluru Urban' })).toBeInTheDocument();
  });

  it('drops a district that does not belong to the newly selected state', async () => {
    const { user } = renderForm();

    await selectOption(user, screen.getByRole('button', { name: 'Select Current State' }), 'Karnataka');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Select Current District' })).toBeEnabled());

    await selectOption(user, screen.getByRole('button', { name: 'Select Current District' }), 'Bengaluru Urban');

    await selectOption(user, screen.getByRole('button', { name: 'Karnataka' }), 'Tamil Nadu');

    // Bengaluru Urban is not a district of Tamil Nadu, so the selection cannot be carried
    // over — the field falls back to its placeholder.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Select Current District' })).toBeInTheDocument();
    });
  });

  it('offers the genders the backend serves', async () => {
    const { loadGenderOptions, user } = renderForm();

    await waitFor(() => expect(loadGenderOptions).toHaveBeenCalled());

    await selectOption(user, screen.getByRole('button', { name: 'Select Gender' }), 'Female');

    expect(screen.getByRole('button', { name: 'Female' })).toBeInTheDocument();
  });

  it('offers the marital statuses the backend serves', async () => {
    const { user } = renderForm();

    await selectOption(user, screen.getByRole('button', { name: 'Select Marital Status' }), 'Married');

    expect(screen.getByRole('button', { name: 'Married' })).toBeInTheDocument();
  });
});
