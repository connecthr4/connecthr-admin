import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Pagination from './Pagination';

/** The numbered page buttons, in order, as the user reads them. */
const getPageNumbers = () =>
  screen
    .getAllByRole('button')
    .filter((button) => !button.hasAttribute('aria-label'))
    .map((button) => Number(button.textContent));

describe('Pagination', () => {
  it('renders nothing when there are no pages', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('lists every page when there are five or fewer', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(getPageNumbers()).toEqual([1, 2, 3]);
  });

  it('marks the current page with aria-current', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('disables "Previous" on the first page and "Next" on the last', () => {
    const { rerender } = render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

    rerender(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('reports the neighbouring page when the arrows are clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('reports the page number when a numbered button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: '4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  describe('when there are more than five pages', () => {
    it('shows the first five pages while the current page is near the start', () => {
      render(<Pagination currentPage={2} totalPages={20} onPageChange={vi.fn()} />);

      expect(getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('keeps the current page in the middle of the window once past the start', () => {
      render(<Pagination currentPage={10} totalPages={20} onPageChange={vi.fn()} />);

      expect(getPageNumbers()).toEqual([8, 9, 10, 11, 12]);
    });

    it('pins the window to the last five pages near the end', () => {
      render(<Pagination currentPage={20} totalPages={20} onPageChange={vi.fn()} />);

      expect(getPageNumbers()).toEqual([16, 17, 18, 19, 20]);
    });
  });
});
