import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import EmployeesDashboard from './EmployeesDashboard';
import { ROLES } from '@/src/lib/auth/roles';
import type { Employee, EmployeeColumn, EmployeeListMeta } from '@/src/lib/types/employees';
import type { FilterOptions } from '@/src/lib/types/filters';
import type { User } from '@/src/lib/types/auth';

/** As the page resolves them on the server, for the header's profile chip. */
const currentUser: User = {
  id: 'clx-current',
  name: 'Shailesh',
  email: 'shailesh@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

const columns: EmployeeColumn[] = [
  { accessorKey: 'employeeId', header: 'Employee ID' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'designation', header: 'Designation' },
  { accessorKey: 'type', header: 'Type' },
];

/**
 * One employee per employment status, so the story shows all four pill colours at once — and
 * shows that only the active row offers the exit action.
 */
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
    employmentStatus: 'Active',
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
    employmentStatus: 'On Notice',
  },
  {
    id: '3',
    avatar: 'https://i.pravatar.cc/150?img=3',
    name: 'Cody Fisher',
    employeeId: '456123789',
    department: 'Sales',
    designation: 'Sales Manager',
    type: 'Office',
    status: 'Permanent',
    employmentStatus: 'Exited',
  },
  {
    id: '4',
    avatar: 'https://i.pravatar.cc/150?img=4',
    name: 'Bessie Cooper',
    employeeId: '789456123',
    department: 'Design',
    designation: 'Graphic Designer',
    type: 'Remote',
    status: 'Contract',
    employmentStatus: 'Inactive',
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
    currentUser,
  },
} satisfies Meta<typeof EmployeesDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
