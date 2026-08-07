import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PayrollInformationForm from './PayrollInformationForm';
import { useEmployeeStore } from '@/src/store/employeeStore';
import type { PayrollInformation } from '@/src/store/employeeStore/types';

const filledPayrollInformation: PayrollInformation = {
  accountHolderName: 'Brooklyn Simmons',
  bankName: 'HDFC Bank',
  accountNumber: '1234567890123456',
  confirmAccountNumber: '1234567890123456',
  ifscCode: 'HDFC0001234',
  branchName: 'Koramangala Branch',
  panNumber: 'ABCDE1234F',
  uanNumber: '100200300400',
  esicNumber: '1234567890',
};

/**
 * Every field of the step, keyed by the placeholder it is queried through — the labels are
 * not tied to their inputs, so the placeholder is what identifies a field here.
 */
const placeholders: Record<keyof PayrollInformation, string> = {
  accountHolderName: 'Enter Account Holder Name',
  bankName: 'Enter Bank Name',
  accountNumber: 'Enter Account Number',
  confirmAccountNumber: 'Confirm Account Number',
  ifscCode: 'Enter IFSC Code',
  branchName: 'Enter Branch Name',
  panNumber: 'Enter PAN Number',
  uanNumber: 'Enter UAN Number',
  esicNumber: 'Enter ESIC Number',
};

/**
 * The form reads its default values from the employee store, so a step is set up by seeding
 * the store rather than by passing props.
 */
const renderForm = (payrollInformation?: Partial<PayrollInformation>) => {
  if (payrollInformation) {
    useEmployeeStore.getState().setPayrollInformation(payrollInformation);
  }

  const onSubmit = vi.fn();

  render(<PayrollInformationForm onSubmit={onSubmit} footer={<button type="submit">Next</button>} />);

  return { onSubmit, user: userEvent.setup() };
};

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Next' }));

const field = (name: keyof PayrollInformation) => screen.getByPlaceholderText(placeholders[name]);

/**
 * Retypes a field, so a seeded-but-invalid value can be corrected the way a user would.
 */
const retype = async (user: ReturnType<typeof userEvent.setup>, name: keyof PayrollInformation, value: string) => {
  await user.clear(field(name));

  if (value) {
    await user.type(field(name), value);
  }
};

describe('PayrollInformationForm', () => {
  afterEach(() => {
    // The store is a module-level singleton, and it seeds the form's default values.
    useEmployeeStore.getState().resetEmployeeData();
  });

  it('renders every field of the step, restoring the values held in the store', () => {
    renderForm(filledPayrollInformation);

    expect(screen.getByText('Bank Account Details')).toBeInTheDocument();
    expect(screen.getByText('Statutory Details')).toBeInTheDocument();

    (Object.keys(placeholders) as (keyof PayrollInformation)[]).forEach((name) => {
      expect(field(name)).toHaveValue(filledPayrollInformation[name]);
    });
  });

  it('starts blank when the store holds no draft', () => {
    renderForm();

    (Object.keys(placeholders) as (keyof PayrollInformation)[]).forEach((name) => {
      expect(field(name)).toHaveValue('');
    });
  });

  it('shows an inline message for every unfilled required field on submit', async () => {
    const { onSubmit, user } = renderForm();

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Account Holder Name is required')).toBeInTheDocument();
    });

    expect(screen.getByText('Bank Name is required')).toBeInTheDocument();
    expect(screen.getByText('Account Number is required')).toBeInTheDocument();
    expect(screen.getByText('Confirm Account Number is required')).toBeInTheDocument();
    expect(screen.getByText('IFSC Code is required')).toBeInTheDocument();
    expect(screen.getByText('Branch Name is required')).toBeInTheDocument();
    expect(screen.getByText('PAN Number is required')).toBeInTheDocument();
    expect(screen.getByText('UAN Number is required')).toBeInTheDocument();
    expect(screen.getByText('ESIC Number is required')).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects an account number outside the 9 to 18 digit range', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await retype(user, 'accountNumber', '12345678');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid Account Number')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a malformed IFSC code', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    // The fifth character has to be a 0, and six more follow it.
    await retype(user, 'ifscCode', 'HDFC1001234');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid IFSC Code')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a malformed PAN number', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    // Five letters, four digits, one letter — lowercase does not pass.
    await retype(user, 'panNumber', 'abcde1234f');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid PAN Number')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a UAN number that is not 12 digits', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await retype(user, 'uanNumber', '10020030');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('UAN Number must be 12 digits')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a malformed ESIC number', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await retype(user, 'esicNumber', '12345');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid ESIC Number')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('reports a confirmation that does not match the account number', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await retype(user, 'confirmAccountNumber', '9999999999999999');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Account numbers do not match')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears a message once the field is corrected', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await retype(user, 'ifscCode', 'HDFC1001234');

    await submit(user);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid IFSC Code')).toBeInTheDocument();
    });

    await retype(user, 'ifscCode', 'HDFC0001234');

    await waitFor(() => {
      expect(screen.queryByText('Enter a valid IFSC Code')).not.toBeInTheDocument();
    });

    await submit(user);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('hands the restored draft back on submit', async () => {
    const { onSubmit, user } = renderForm(filledPayrollInformation);

    await submit(user);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject(filledPayrollInformation);
  });

  it('submits the values typed into a blank step', async () => {
    const { onSubmit, user } = renderForm();

    for (const [name, value] of Object.entries(filledPayrollInformation)) {
      await user.type(field(name as keyof PayrollInformation), value);
    }

    await submit(user);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject(filledPayrollInformation);
  });
});
