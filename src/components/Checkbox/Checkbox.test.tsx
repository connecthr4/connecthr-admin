import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders a labelled checkbox and forwards name, value and required attributes', () => {
    render(<Checkbox label="Accept terms" name="terms" required value="accepted" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveAttribute('name', 'terms');
    expect(checkbox).toHaveAttribute('value', 'accepted');
    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute('id', 'terms');
  });

  it('renders a ReactNode label', () => {
    render(
      <Checkbox
        label={
          <span>
            Custom <strong>label</strong>
          </span>
        }
        name="custom"
      />
    );

    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('label')).toBeInTheDocument();
  });

  it('calls onChange with the new checked state when toggled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox label="Subscribe" name="subscribe" onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Subscribe' });
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not call onChange and stays unchecked when disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox disabled label="Subscribe" name="subscribe" onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Subscribe' });
    await user.click(checkbox);

    expect(checkbox).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports a controlled checked state', () => {
    const { rerender } = render(<Checkbox checked label="Controlled" name="controlled" onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Controlled' })).toBeChecked();

    rerender(<Checkbox checked={false} label="Controlled" name="controlled" onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Controlled' })).not.toBeChecked();
  });

  it('supports an uncontrolled defaultChecked state', () => {
    render(<Checkbox defaultChecked label="Uncontrolled" name="uncontrolled" />);
    expect(screen.getByRole('checkbox', { name: 'Uncontrolled' })).toBeChecked();
  });

  it('sets the underlying input to indeterminate when requested', () => {
    const { rerender } = render(<Checkbox indeterminate label="Select all" name="select-all" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);

    rerender(<Checkbox indeterminate={false} label="Select all" name="select-all" />);
    expect(checkbox.indeterminate).toBe(false);
  });

  it('applies custom className and style to the root label', () => {
    render(
      <Checkbox
        className="custom-checkbox"
        label="Styled"
        name="styled"
        style={{ marginTop: 8 }}
      />
    );

    const label = screen.getByText('Styled').closest('label');
    expect(label).toHaveClass('custom-checkbox');
    expect(label).toHaveStyle({ marginTop: '8px' });
  });

  it('renders an error message when provided and omits it otherwise', () => {
    const { rerender } = render(<Checkbox error="This field is required" label="Terms" name="terms" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();

    rerender(<Checkbox label="Terms" name="terms" />);
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });
});
