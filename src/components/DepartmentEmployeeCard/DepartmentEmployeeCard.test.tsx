import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DepartmentEmployeeCard from './DepartmentEmployeeCard';

const employees = [
  { id: 1, name: 'Dianne Russell', designation: 'Lead UI/UX Designer', avatar: '/avatars/avatar-1.png' },
  { id: 2, name: 'Arlene McCoy', designation: 'Sr. UI/UX Designer', avatar: '/avatars/avatar-2.png' },
];

describe('DepartmentEmployeeCard', () => {
  it('renders the department name and member count', () => {
    render(<DepartmentEmployeeCard departmentName="Design Department" totalMembers={20} employees={employees} />);

    expect(screen.getByText('Design Department')).toBeInTheDocument();
    expect(screen.getByText('20 Members')).toBeInTheDocument();
  });

  it('renders each employee with their name, designation and avatar', () => {
    render(<DepartmentEmployeeCard departmentName="Design Department" totalMembers={20} employees={employees} />);

    expect(screen.getByText('Dianne Russell')).toBeInTheDocument();
    expect(screen.getByText('Lead UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText('Arlene McCoy')).toBeInTheDocument();
    expect(screen.getByText('Sr. UI/UX Designer')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Dianne Russell' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Arlene McCoy' })).toBeInTheDocument();
  });

  it('calls onViewAll when "View All" is clicked', async () => {
    const user = userEvent.setup();
    const onViewAll = vi.fn();
    render(
      <DepartmentEmployeeCard
        departmentName="Design Department"
        totalMembers={20}
        employees={employees}
        onViewAll={onViewAll}
      />
    );

    await user.click(screen.getByRole('button', { name: 'View All' }));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('reports the clicked employee through onEmployeeClick', async () => {
    const user = userEvent.setup();
    const onEmployeeClick = vi.fn();
    render(
      <DepartmentEmployeeCard
        departmentName="Design Department"
        totalMembers={20}
        employees={employees}
        onEmployeeClick={onEmployeeClick}
      />
    );

    await user.click(screen.getByRole('button', { name: /Arlene McCoy/ }));

    expect(onEmployeeClick).toHaveBeenCalledWith(employees[1]);
  });

  it('renders no employee rows when the list is empty', () => {
    render(<DepartmentEmployeeCard departmentName="Design Department" totalMembers={0} employees={[]} />);

    expect(screen.getByText('0 Members')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('does not throw when an employee is clicked without a handler', async () => {
    const user = userEvent.setup();
    render(<DepartmentEmployeeCard departmentName="Design Department" totalMembers={20} employees={employees} />);

    await expect(user.click(screen.getByRole('button', { name: /Dianne Russell/ }))).resolves.toBeUndefined();
  });
});
