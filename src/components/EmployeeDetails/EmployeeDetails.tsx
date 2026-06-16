/**
 * Displays detailed employee information, including profile, personal details, professional details, documents, and payroll details
 *
 * @example
 * ```tsx
 * import EmployeeDetails from '@src/components/EmployeeDetails'
 *
 * export default function EmployeeDetails() {
 *   return <EmployeeDetails label="Hello" />;
 * }
 * ```
 */

import AppHeader from '../AppHeader';
import Button from '../Button';
import { Heading5, Text4 } from '../Typography/Typography';
import { BriefcaseBusiness, Phone, PencilLine } from 'lucide-react';
import styles from './EmployeeDetails.module.scss';

/**
 * Define the props available for the EmployeeDetails component.
 */
interface EmployeeDetailsProps {
  label?: string;
}

export default function EmployeeDetails({ label = 'label' }: EmployeeDetailsProps) {
  return (
    <div className={styles.container}>
      <AppHeader
        title="Brooklyn Simmons"
        breadcrumbs={[{ label: 'All Employees', href: '/employees' }, { label: 'Brooklyn Simmons' }]}
      />

      <div className={styles.content}>
        <EmployeeProfileHeader />
      </div>
    </div>
  );
}

interface EmployeeProfileHeaderProps {
  employeeInfo: {
    name: string;
    designation: string;
    phone: string;
    avatar: string;
  };
  onEdit?: () => void;
}

function EmployeeProfileHeader({ employeeInfo, onEdit }: EmployeeProfileHeaderProps) {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.employeeInfo}>
        <img src={employeeInfo?.avatar} alt={employeeInfo?.name} className={styles.avatar} />
        <div className={styles.details}>
          <Heading5>Brooklyn Simmons</Heading5>
          <div className={styles.columnContainer}>
            <div className={styles.metaItem}>
              <BriefcaseBusiness size={24} />
              <Text4>Project Manager</Text4>
            </div>
            <div className={styles.metaItem}>
              <Phone size={24} />
              <Text4>3875496397</Text4>
            </div>
          </div>
        </div>
      </div>
      <Button startIcon={PencilLine}>Edit Profile</Button>
    </div>
  );
}
