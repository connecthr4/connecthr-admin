import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('renders with the default placeholder and a search icon', () => {
    const { container } = render(<SearchInput />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(container.querySelector('.lucide-search')).toBeInTheDocument();
  });

  it('uses a custom placeholder when one is given', () => {
    render(<SearchInput placeholder="Search employee..." />);

    expect(screen.getByPlaceholderText('Search employee...')).toBeInTheDocument();
  });

  it('reports each keystroke through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('Search'), 'ab');

    /* Controlled with a fixed value, so each keystroke reports just itself. */
    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'b');
  });

  it('hides the clear icon while the field is empty', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} />);

    expect(container.querySelector('.lucide-x')).not.toBeInTheDocument();
  });

  it('shows the clear icon once there is a value', () => {
    const { container } = render(<SearchInput value="Jane" onChange={vi.fn()} />);

    expect(container.querySelector('.lucide-x')).toBeInTheDocument();
  });

  it('calls onClear when the clear icon is clicked and one is given', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    const { container } = render(<SearchInput value="Jane" onChange={onChange} onClear={onClear} />);

    await user.click(container.querySelector('.lucide-x') as SVGElement);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('falls back to reporting an empty value through onChange when no onClear is given', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<SearchInput value="Jane" onChange={onChange} />);

    await user.click(container.querySelector('.lucide-x') as SVGElement);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
