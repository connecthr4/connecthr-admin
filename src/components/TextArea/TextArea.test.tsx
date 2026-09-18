import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TextArea from './TextArea';

describe('TextArea', () => {
  it('renders an associated required label and field attributes', () => {
    render(
      <TextArea
        id="reason"
        name="reason"
        label="Reason for Leaving"
        placeholder="Enter the reason"
        rows={6}
        maxLength={500}
        required
      />
    );

    const field = screen.getByLabelText(/reason for leaving/i);

    expect(field).toHaveAttribute('id', 'reason');
    expect(field).toHaveAttribute('name', 'reason');
    expect(field).toHaveAttribute('rows', '6');
    expect(field).toHaveAttribute('maxlength', '500');
    expect(field).toHaveAttribute('placeholder', 'Enter the reason');
    expect(field).toBeRequired();
  });

  it('forwards changes and blur to the caller', async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const user = userEvent.setup();

    render(<TextArea aria-label="Additional Notes" onChange={onChange} onBlur={onBlur} />);

    await user.type(screen.getByRole('textbox', { name: 'Additional Notes' }), 'Ada');
    await user.tab();

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors and supports disabled fields', () => {
    render(<TextArea aria-label="Reason for Leaving" error="Reason for Leaving is required" disabled />);

    expect(screen.getByText('Reason for Leaving is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Reason for Leaving' })).toBeDisabled();
  });
});
