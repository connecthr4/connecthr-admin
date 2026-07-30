import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import EmployeesDashboard from './EmployeesDashboard';
import type { Employee, EmployeeColumn, EmployeeListMeta } from '@/src/lib/types/employees';

const columns: EmployeeColumn[] = [
  { accessorKey: 'employeeId', header: 'Employee ID' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'designation', header: 'Designation' },
  { accessorKey: 'type', header: 'Type' },
];

const employees: Employee[] = [
  {
    id: '1',
    avatar: 'https://i.pravatar.cc/150?img=1',
    name: 'Darlene Robertson',
    employeeId: '345321231',
    department: 'Design',
    designation: 'UI/UX Designer',
    type: 'Office',
    status: 'Permanent',
  },
  {
    id: '2',
    avatar: 'https://i.pravatar.cc/150?img=2',
    name: 'Floyd Miles',
    employeeId: '987890345',
    department: 'Development',
    designation: 'PHP Developer',
    type: 'Office',
    status: 'Permanent',
  },
];

const meta_: EmployeeListMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: employees.length,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const meta = {
  title: 'components/EmployeesDashboard',
  component: EmployeesDashboard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    initialColumns: columns,
    initialEmployees: employees,
    initialMeta: meta_,
  },
} satisfies Meta<typeof EmployeesDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
