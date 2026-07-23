import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowRight, Plus } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import Button from './Button';

describe('Button', () => {
  it('renders a clickable button and forwards native button props', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button
        aria-label="Save employee"
        className="custom-button"
        data-tracking-id="save"
        onClick={onClick}
        type="submit"
      >
        Save
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Save employee' });
    await user.click(button);

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-tracking-id', 'save');
    expect(button).toHaveClass('custom-button');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders start and end icons with their supplied sizes and colours', () => {
    render(
      <Button endIcon={ArrowRight} endIconColor="blue" iconSize={18} startIcon={Plus} startIconColor="red">
        Add employee
      </Button>
    );

    const icons = screen.getByRole('button', { name: 'Add employee' }).querySelectorAll('svg');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveAttribute('width', '18');
    expect(icons[0]).toHaveAttribute('stroke', 'red');
    expect(icons[1]).toHaveAttribute('width', '18');
    expect(icons[1]).toHaveAttribute('stroke', 'blue');
  });

  it('disables interaction and displays a loader while loading', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button endIcon={ArrowRight} loading onClick={onClick} startIcon={Plus}>
        Saving changes
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Saving changes' });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
    expect(button.querySelectorAll('svg')).toHaveLength(0);
    expect(button.querySelector('span')).toBeInTheDocument();
  });

  it('respects an explicitly disabled button and each supported variant', () => {
    const { rerender } = render(
      <Button disabled variant="secondary">
        Cancel
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    rerender(<Button variant="text">View all</Button>);
    expect(screen.getByRole('button', { name: 'View all' })).toBeEnabled();
  });
});
