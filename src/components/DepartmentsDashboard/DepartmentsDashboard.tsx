/**
 * A dashboard component for managing and viewing all departments and their associated employees
 *
 * @example
 * ```tsx
 * import DepartmentsDashboard from '@src/components/DepartmentsDashboard'
 *
 * export default function DepartmentsDashboard() {
 *   return <DepartmentsDashboard label="Hello" />;
 * }
 * ```
 */

import AppHeader from '../AppHeader';
import DepartmentEmployeeCard from '../DepartmentEmployeeCard';
import styles from './DepartmentsDashboard.module.scss';

/**
 * Define the props available for the DepartmentsDashboard component.
 */
interface DepartmentsDashboardProps {
  label?: string;
}

export default function DepartmentsDashboard({ label = 'label' }: DepartmentsDashboardProps) {
  const departments = [
    {
      id: 1,
      departmentName: 'Design Department',
      totalMembers: 20,
      employees: [
        {
          id: 1,
          name: 'Dianne Russell',
          designation: 'Lead UI/UX Designer',
          avatar: '/avatars/avatar-1.png',
        },
        {
          id: 2,
          name: 'Arlene McCoy',
          designation: 'Sr. UI/UX Designer',
          avatar: '/avatars/avatar-2.png',
        },
        {
          id: 3,
          name: 'Cody Fisher',
          designation: 'UI/UX Designer',
          avatar: '/avatars/avatar-3.png',
        },
        {
          id: 4,
          name: 'Theresa Webb',
          designation: 'UI/UX Designer',
          avatar: '/avatars/avatar-4.png',
        },
        {
          id: 5,
          name: 'Ronald Richards',
          designation: 'UI/UX Designer',
          avatar: '/avatars/avatar-5.png',
        },
        {
          id: 4,
          name: 'Theresa Webb',
          designation: 'UI/UX Designer',
          avatar: '/avatars/avatar-4.png',
        },
        {
          id: 5,
          name: 'Ronald Richards',
          designation: 'UI/UX Designer',
          avatar: '/avatars/avatar-5.png',
        },
      ],
    },
    {
      id: 2,
      departmentName: 'Marketing Department',
      totalMembers: 10,
      employees: [
        {
          id: 1,
          name: 'Wade Warren',
          designation: 'Sr. Marketing Manager',
          avatar: '/avatars/avatar-6.png',
        },
        {
          id: 2,
          name: 'Brooklyn Simmons',
          designation: 'Marketing Coordinator',
          avatar: '/avatars/avatar-7.png',
        },
        {
          id: 3,
          name: 'Jacob Jones',
          designation: 'Marketing Coordinator',
          avatar: '/avatars/avatar-8.png',
        },
      ],
    },
    {
      id: 3,
      departmentName: 'Sales Department',
      totalMembers: 14,
      employees: [
        {
          id: 1,
          name: 'Darrell Steward',
          designation: 'Sales Manager',
          avatar: '/avatars/avatar-9.png',
        },
        {
          id: 2,
          name: 'Kristin Watson',
          designation: 'BDM',
          avatar: '/avatars/avatar-10.png',
        },
      ],
    },
  ];
  return (
    <div className={styles.container}>
      <AppHeader title="All Departments" subtitle="All Departments Information" />

      <div className={styles.content}>
        <div className={styles.departmentsGrid}>
          {departments.map((department) => (
            <DepartmentEmployeeCard
              key={department.id}
              departmentName={department.departmentName}
              totalMembers={department.totalMembers}
              employees={department.employees}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
