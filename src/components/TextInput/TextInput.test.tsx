import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TextInput from './TextInput';

describe('TextInput', () => {
  it('renders an associated required label and input attributes', () => {
    render(
      <TextInput id="email" name="email" label="Email address" placeholder="you@example.com" required type="email" />
    );

    const input = screen.getByLabelText(/email address/i);
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });

  it('forwards changes and renders supplied icons', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TextInput
        aria-label="Search employees"
        onChange={onChange}
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      />
    );

    await user.type(screen.getByRole('textbox', { name: 'Search employees' }), 'Ada');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('shows validation errors and supports disabled inputs', () => {
    render(<TextInput aria-label="Employee ID" error="Employee ID is required" disabled />);

    expect(screen.getByText('Employee ID is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Employee ID' })).toBeDisabled();
  });

  it('toggles a password between hidden and visible', async () => {
    const user = userEvent.setup();
    render(<TextInput aria-label="Password" type="password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
