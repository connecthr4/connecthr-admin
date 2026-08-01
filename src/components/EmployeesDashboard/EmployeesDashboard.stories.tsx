import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import EmployeesDashboard from './EmployeesDashboard';
import type { Employee, EmployeeColumn, EmployeeListMeta } from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';

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

const filterOptions: FilterOptions = [
  {
    id: 'department',
    label: 'Department',
    isMulti: true,
    options: [
      { label: 'Design', value: 'Design' },
      { label: 'Development', value: 'Development' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    isMulti: true,
    options: [
      { label: 'Permanent', value: 'PERMANENT' },
      { label: 'Contract', value: 'CONTRACT' },
    ],
  },
];

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
    filterOptions,
  },
} satisfies Meta<typeof EmployeesDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
