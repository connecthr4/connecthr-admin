import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders a labelled navigation landmark with links for parent items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Employees', href: '/employees' },
          { label: 'Add new employee' },
        ]}
      />
    );

    const navigation = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/employees');
    expect(screen.getByText('Add new employee')).toBeInTheDocument();
    expect(navigation.querySelectorAll('svg')).toHaveLength(2);
  });

  it('renders the final item as current text even when it has an href', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Employees', href: '/employees' },
          { label: 'Ada Lovelace', href: '/employees/ada-lovelace' },
        ]}
      />
    );

    expect(screen.getByRole('link', { name: 'Employees' })).toHaveAttribute('href', '/employees');
    expect(screen.queryByRole('link', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders non-linked parent items as text and still separates them', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Employees', href: '/employees' },
          { label: 'Archived employees' },
          { label: 'Employee details' },
        ]}
      />
    );

    const navigation = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(screen.queryByRole('link', { name: 'Archived employees' })).not.toBeInTheDocument();
    expect(screen.getByText('Archived employees')).toBeInTheDocument();
    expect(navigation.querySelectorAll('svg')).toHaveLength(2);
  });

  it('supports a single current item and an empty breadcrumb list', () => {
    const { rerender } = render(<Breadcrumbs items={[{ label: 'Dashboard', href: '/' }]} />);

    const navigation = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(navigation.querySelectorAll('svg')).toHaveLength(0);

    rerender(<Breadcrumbs items={[]} />);
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeEmptyDOMElement();
  });
});
