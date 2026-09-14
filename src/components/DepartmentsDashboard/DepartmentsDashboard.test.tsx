import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DepartmentsDashboard from './DepartmentsDashboard';

vi.mock('../AppHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <header>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  ),
}));

vi.mock('../DepartmentEmployeeCard', () => ({
  default: ({
    departmentName,
    totalMembers,
    employees,
  }: {
    departmentName: string;
    totalMembers: number;
    employees: { id: number; name: string }[];
  }) => (
    <section data-testid="department-card">
      <h2>{departmentName}</h2>
      <span>{`${totalMembers} members`}</span>
      <span>{`${employees.length} listed`}</span>
    </section>
  ),
}));

describe('DepartmentsDashboard', () => {
  it('renders the header with the departments title and subtitle', () => {
    render(<DepartmentsDashboard />);

    expect(screen.getByRole('heading', { level: 1, name: 'All Departments' })).toBeInTheDocument();
    expect(screen.getByText('All Departments Information')).toBeInTheDocument();
  });

  it('renders one card per department', () => {
    render(<DepartmentsDashboard />);

    expect(screen.getAllByTestId('department-card')).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 2, name: 'Design Department' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Marketing Department' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Sales Department' })).toBeInTheDocument();
  });

  it('hands each card its member count and employee list', () => {
    render(<DepartmentsDashboard />);

    expect(screen.getByText('20 members')).toBeInTheDocument();
    expect(screen.getByText('7 listed')).toBeInTheDocument();

    expect(screen.getByText('10 members')).toBeInTheDocument();
    expect(screen.getByText('3 listed')).toBeInTheDocument();

    expect(screen.getByText('14 members')).toBeInTheDocument();
    expect(screen.getByText('2 listed')).toBeInTheDocument();
  });
});
