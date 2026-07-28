/**
 * A dashboard component for displaying, managing, and monitoring all employee records in a centralized view.
 *
 * @example
 * ```tsx
 * import EmployeesDashboard from '@src/components/EmployeesDashboard'
 *
 * export default function EmployeesDashboard() {
 *   return <EmployeesDashboard label="Hello" />;
 * }
 * ```
 */
'use client';

import AppHeader from '../AppHeader';
import Button from '../Button';
import SearchInput from '../SearchInput';
import { CirclePlus, SlidersHorizontal } from 'lucide-react';
import styles from './EmployeesDashboard.module.scss';
import DataTable from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export interface Employee {
  id: string;
  avatar: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  type: 'Office' | 'Remote';
  status: 'Permanent' | 'Contract' | 'Probation';
}

/**
 * Define the props available for the EmployeesDashboard component.
 */
interface EmployeesDashboardProps {
  label?: string;
}

export default function EmployeesDashboard({ label = 'label' }: EmployeesDashboardProps) {
  const employeeColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Employee Name',
      cell: ({ row }) => (
        <div className={styles.employeeCell}>
          <img
            src={row.original.avatar}
            alt={row.original.name}
            width={40}
            height={40}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />

          <span>{row.original.name}</span>
        </div>
      ),
    },

    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
    },

    {
      accessorKey: 'department',
      header: 'Department',
    },

    {
      accessorKey: 'designation',
      header: 'Designation',
    },

    {
      accessorKey: 'type',
      header: 'Type',
    },

    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <span className="statusBadge">{getValue() as string}</span>,
    },

    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,

      cell: ({ row }) => (
        <div className={styles.actions}>
          <Eye size={20} className={clsx(styles.actionIcon)} onClick={() => console.log('View', row.original.id)} />

          <Pencil size={20} className={clsx(styles.actionIcon)} onClick={() => console.log('Edit', row.original.id)} />

          <Trash2
            size={20}
            className={clsx(styles.actionIcon)}
            onClick={() => console.log('Delete', row.original.id)}
          />
        </div>
      ),
    },
  ];

  const employees = [
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
    {
      id: '3',
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: 'Cody Fisher',
      employeeId: '453367122',
      department: 'Sales',
      designation: 'Sales Manager',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '4',
      avatar: 'https://i.pravatar.cc/150?img=4',
      name: 'Dianne Russell',
      employeeId: '345321232',
      department: 'Sales',
      designation: 'BDM',
      type: 'Remote',
      status: 'Permanent',
    },
    {
      id: '5',
      avatar: 'https://i.pravatar.cc/150?img=5',
      name: 'Savannah Nguyen',
      employeeId: '453677881',
      department: 'Design',
      designation: 'Design Lead',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '6',
      avatar: 'https://i.pravatar.cc/150?img=6',
      name: 'Jacob Jones',
      employeeId: '009918765',
      department: 'Development',
      designation: 'Python Developer',
      type: 'Remote',
      status: 'Permanent',
    },
    {
      id: '7',
      avatar: 'https://i.pravatar.cc/150?img=7',
      name: 'Marvin McKinney',
      employeeId: '238870122',
      department: 'Development',
      designation: 'Sr. UI Developer',
      type: 'Remote',
      status: 'Permanent',
    },
    {
      id: '8',
      avatar: 'https://i.pravatar.cc/150?img=8',
      name: 'Brooklyn Simmons',
      employeeId: '124335111',
      department: 'PM',
      designation: 'Project Manager',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '9',
      avatar: 'https://i.pravatar.cc/150?img=9',
      name: 'Kristin Watson',
      employeeId: '435540099',
      department: 'HR',
      designation: 'HR Executive',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '10',
      avatar: 'https://i.pravatar.cc/150?img=10',
      name: 'Kathryn Murphy',
      employeeId: '009812890',
      department: 'Development',
      designation: 'React JS Developer',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '11',
      avatar: 'https://i.pravatar.cc/150?img=11',
      name: 'Arlene McCoy',
      employeeId: '671190345',
      department: 'Development',
      designation: 'Node JS Developer',
      type: 'Office',
      status: 'Permanent',
    },
    {
      id: '12',
      avatar: 'https://i.pravatar.cc/150?img=12',
      name: 'Devon Lane',
      employeeId: '091233412',
      department: 'Business Analysis',
      designation: 'Business Analyst',
      type: 'Remote',
      status: 'Permanent',
    },
    {
      id: '13',
      avatar: 'https://i.pravatar.cc/150?img=13',
      name: 'Jenny Wilson',
      employeeId: '982341245',
      department: 'HR',
      designation: 'HR Manager',
      type: 'Office',
      status: 'Contract',
    },
    {
      id: '14',
      avatar: 'https://i.pravatar.cc/150?img=14',
      name: 'Ronald Richards',
      employeeId: '345982111',
      department: 'Finance',
      designation: 'Finance Executive',
      type: 'Office',
      status: 'Probation',
    },
    {
      id: '15',
      avatar: 'https://i.pravatar.cc/150?img=15',
      name: 'Courtney Henry',
      employeeId: '772341890',
      department: 'QA',
      designation: 'QA Engineer',
      type: 'Remote',
      status: 'Permanent',
    },
  ];

  return (
    <div className={styles.container}>
      <AppHeader title="All Employees" subtitle="All Employee Information" />

      <div className={styles.content}>
        <div className={styles.header}>
          <SearchInput placeholder="Search employee..." />

          <Button startIcon={CirclePlus} onChange={() => {}} className={styles.button}>
            Add New Employee
          </Button>

          <Button
            startIcon={SlidersHorizontal}
            variant="secondary"
            onChange={() => {}}
            className={styles.button}
            startIconColor="var(--color-black)"
          >
            Filter
          </Button>
        </div>

        <div className={styles.tableContainer}>
          <DataTable data={employees} columns={employeeColumns} />
        </div>
      </div>
    </div>
  );
}
