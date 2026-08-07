import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import DynamicForm, { FieldConfig, FieldWidth } from './DynamicForm';

const schema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
});

type Values = z.infer<typeof schema>;

const fields: FieldConfig<Values>[] = [
  {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter First Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Enter Last Name',
    type: 'input',
    width: FieldWidth.HALF,
    required: true,
  },
];

const renderForm = (onSubmit = vi.fn()) => {
  render(
    <DynamicForm
      fields={fields}
      schema={schema}
      defaultValues={{ firstName: '', lastName: '' }}
      onSubmit={onSubmit}
      footer={<button type="submit">Next</button>}
    />
  );

  return onSubmit;
};

describe('DynamicForm', () => {
  it('shows an inline message for every unfilled required field on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByPlaceholderText('Enter First Name'), 'Mahesh');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Required fields render a native required attribute, so the form has to opt out of
    // browser validation for the resolver's messages to surface at all.
    await waitFor(() => {
      expect(screen.getByText('Last Name is required')).toBeInTheDocument();
    });

    expect(screen.queryByText('First Name is required')).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits once every required field is filled', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByPlaceholderText('Enter First Name'), 'Mahesh');
    await user.type(screen.getByPlaceholderText('Enter Last Name'), 'Rudrajarju');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ firstName: 'Mahesh', lastName: 'Rudrajarju' });
  });
});
