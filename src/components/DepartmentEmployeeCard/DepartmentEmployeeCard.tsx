/**
 * A reusable card component for displaying department details along with a list of associated employees.
 *
 * @example
 * ```tsx
 * import DepartmentEmployeeCard from '@src/components/DepartmentEmployeeCard'
 *
 * export default function DepartmentEmployeeCard() {
 *   return <DepartmentEmployeeCard label="Hello" />;
 * }
 * ```
 */
'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import styles from './DepartmentEmployeeCard.module.scss';
import { Heading4, Text1, Text2 } from '../Typography';
import Button from '../Button';

interface Employee {
  id: number;
  name: string;
  designation: string;
  avatar: string;
}

/**
 * Define the props available for the DepartmentEmployeeCard component.
 */
interface DepartmentEmployeeCardProps {
  departmentName: string;
  totalMembers: number;
  employees: Employee[];
  onViewAll?: () => void;
  onEmployeeClick?: (employee: Employee) => void;
}

export default function DepartmentEmployeeCard({
  departmentName,
  totalMembers,
  employees,
  onViewAll,
  onEmployeeClick,
}: DepartmentEmployeeCardProps) {
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Heading4>{departmentName}</Heading4>

          <Text2 className={styles.memberCount}>{totalMembers} Members</Text2>
        </div>

        <Button variant="text" onClick={onViewAll} className={styles.viewAllButton}>
          View All
        </Button>
      </div>

      <div className={styles.divider} />

      {/* Employee List */}
      <div className={styles.employeeList}>
        {employees.map((employee) => (
          <button key={employee.id} onClick={() => onEmployeeClick?.(employee)} className={styles.employeeItem}>
            <div className={styles.employeeInfo}>
              {/* Avatar */}
              <div className={styles.avatarWrapper}>
                <Image src={employee.avatar} alt={employee.name} fill className={styles.avatar} />
              </div>

              {/* Employee Details */}
              <div>
                <Text1>{employee.name}</Text1>

                <Text2 className={styles.employeeDesignation}>{employee.designation}</Text2>
              </div>
            </div>

            <ChevronRight size={20} className={styles.arrowIcon} />
          </button>
        ))}
      </div>
    </div>
  );
}
