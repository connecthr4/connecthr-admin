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
'use client';

import AppHeader from '../AppHeader';
import Button from '../Button';
import { Heading5, Text1, Text2, Text3, Text4 } from '../Typography/Typography';
import { BriefcaseBusiness, Phone, PencilLine, UserRound, LogOut, ClipboardList } from 'lucide-react';
import styles from './EmployeeDetails.module.scss';
import { useState } from 'react';
import clsx from 'clsx';
import Stepper from '../Stepper';
import { STEPS } from '@/src/constants/strings';
import { useRouter } from 'next/navigation';

/**
 * Define the props available for the EmployeeDetails component.
 */
interface EmployeeDetailsProps {
  label?: string;
}

const personalInfo = [
  {
    title: 'Personal Details',
    fields: [
      { label: 'First Name', value: 'Brooklyn' },
      { label: 'Last Name', value: 'Simmons' },
      { label: 'Mobile Number', value: '9876543210' },
      { label: 'Email Address', value: 'brooklyn.s@example.com' },
      { label: 'Date of Birth', value: 'July 10, 1992' },
      { label: 'Gender', value: 'Female' },
      { label: 'Nationality', value: 'American' },
      { label: 'Marital Status', value: 'Single' },
      { label: 'Aadhaar Number', value: '123456789012' },
    ],
  },
  {
    title: 'Address Information',
    fields: [
      { label: 'Current Address', value: '2464 Royal Ln.' },
      { label: 'Current City', value: 'Mesa' },
      { label: 'Current State', value: 'New Jersey' },
      { label: 'Current PIN Code', value: '560001' },
      { label: 'Permanent Address', value: '2464 Royal Ln.' },
      { label: 'Permanent City', value: 'Mesa' },
      { label: 'Permanent State', value: 'New Jersey' },
      { label: 'Permanent PIN Code', value: '560001' },
    ],
  },
  {
    title: 'Emergency Contact Details',
    fields: [
      { label: 'Emergency Contact Name', value: 'Robert Simmons' },
      { label: 'Relationship', value: 'Father' },
      { label: 'Emergency Phone Number', value: '9123456789' },
      {
        label: 'Emergency Address',
        value: '123 Main Street, Mesa, New Jersey',
        fullWidth: true,
      },
    ],
  },
];

const professionalInfo = [
  {
    title: 'Employment Details',
    fields: [
      {
        label: 'Employee ID',
        value: 'EMP001',
      },
      {
        label: 'Employee Type',
        value: 'Full Time',
      },
      {
        label: 'Employment Status',
        value: 'Active',
      },
      {
        label: 'Date of Joining',
        value: '15 Jan 2024',
      },
      {
        label: 'Department',
        value: 'Engineering',
      },
    ],
  },
];

const payrollInfo = [
  {
    title: 'Bank Account Details',
    fields: [
      {
        label: 'Account Holder Name',
        value: 'Brooklyn Simmons',
      },
      {
        label: 'Bank Name',
        value: 'HDFC Bank',
      },
      {
        label: 'Account Number',
        value: '1234567890123456',
      },
      {
        label: 'Confirm Account Number',
        value: '1234567890123456',
      },
      {
        label: 'IFSC Code',
        value: 'HDFC0001234',
      },
      {
        label: 'Branch Name',
        value: 'Koramangala Branch',
      },
    ],
  },
  {
    title: 'Statutory Details',
    fields: [
      {
        label: 'PAN Number',
        value: 'ABCDE1234F',
      },
      {
        label: 'UAN Number',
        value: '100200300400',
      },
      {
        label: 'ESIC Number',
        value: '1234567890',
      },
    ],
  },
];
const documentInfo = [];

const employeeSections = [
  {
    title: 'Personal Information',
    data: personalInfo,
  },
  {
    title: 'Professional Information',
    data: professionalInfo,
  },
  {
    title: 'Payroll Information',
    data: payrollInfo,
  },
  {
    title: 'Documents',
    data: documentInfo,
  },
];

export default function EmployeeDetails({ label = 'label' }: EmployeeDetailsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const activeSection = employeeSections[currentStep];
  return (
    <div className={styles.container}>
      <AppHeader
        title="Brooklyn Simmons"
        breadcrumbs={[{ label: 'All Employees', href: '/employees' }, { label: 'Brooklyn Simmons' }]}
      />

      <div className={styles.content}>
        <EmployeeProfileHeader />
        <div className={styles.subContent}>
          <EmployeeProfileSidebar items={profileItems} />
          <div className={styles.detailsContent}>
            <Stepper currentStep={currentStep} steps={STEPS} onStepChange={setCurrentStep} />

            <EmployeeInfoSection data={activeSection.data} />
          </div>
        </div>
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
}

function EmployeeProfileHeader({ employeeInfo }: EmployeeProfileHeaderProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push('/employees/EMP001/edit');
  };

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
      <Button startIcon={PencilLine} onClick={handleEdit}>
        Edit Profile
      </Button>
    </div>
  );
}

interface SidebarItem {
  label: string;
  icon: React.ElementType;
  href?: string;
}

interface EmployeeProfileSidebarProps {
  items: SidebarItem[];
}

export const profileItems = [
  {
    label: 'Profile',
    icon: UserRound,
    href: '/attendance',
  },
  {
    label: 'Separation',
    icon: LogOut,
    href: '/projects',
  },
];

function EmployeeProfileSidebar({}: EmployeeProfileSidebarProps) {
  const [selectedItem, setSelectedItem] = useState(profileItems[0].label);
  return (
    <div className={styles.sidebar}>
      <div className={styles.itemContainer}>
        {profileItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={clsx(styles.menuItem, {
                [styles.active]: selectedItem === item.label,
              })}
              onClick={() => setSelectedItem(item.label)}
            >
              <Icon size={24} />
              <Text4>{item.label}</Text4>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DetailItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

interface DetailSection {
  title: string;
  fields: DetailItem[];
}

interface EmployeeInfoSectionProps {
  data: DetailSection[];
}

function EmployeeInfoSection({ data }: EmployeeInfoSectionProps) {
  return (
    <div className={styles.sectionContainer}>
      {data.map((section) => (
        <div key={section.title} className={styles.section}>
          <Text1 className={styles.infoHeader}>{section.title}</Text1>

          <div className={styles.infoGrid}>
            {section.fields.map((item) => (
              <div
                key={item.label}
                className={clsx(styles.infoItem, {
                  [styles.fullWidth]: item.fullWidth,
                })}
              >
                <Text2 className={styles.label}>{item.label}</Text2>

                <Text4 className={styles.value}>{item.value}</Text4>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
