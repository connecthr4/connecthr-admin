/**
 * Displays detailed employee information, including profile, personal details, professional details, documents, and payroll details
 *
 * @example
 * ```tsx
 * import EmployeeDetails from '@src/components/EmployeeDetails'
 *
 * export default function EmployeeDetails({ employee }) {
 *   return <EmployeeDetails employee={employee} />;
 * }
 * ```
 */
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { BriefcaseBusiness, Phone, PencilLine, UserRound, LogOut } from 'lucide-react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import Stepper from '../Stepper';
import { Heading5, Text1, Text2, Text4 } from '../Typography/Typography';
import { ROUTES, STEPS, STRINGS } from '@/src/constants/strings';
import { formatLongDate } from '@/src/utils/date';
import type { EmployeeDetail } from '@/src/lib/types/employees';
import styles from './EmployeeDetails.module.scss';

/**
 * Define the props available for the EmployeeDetails component.
 */
interface EmployeeDetailsProps {
  employee: EmployeeDetail;
}

const EMPTY_VALUE = '-';

interface FieldConfig {
  label: string;

  /**
   * Reads the field off the whole record rather than off one of its sub-objects: a few
   * displayed fields (e.g. Employee ID) live at the root, next to the section they belong to.
   */
  get: (employee: EmployeeDetail) => string | undefined;

  fullWidth?: boolean;
}

interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

const personalSections: SectionConfig[] = [
  {
    title: 'Personal Details',
    fields: [
      { label: 'First Name', get: (e) => e.personalInformation.firstName },
      { label: 'Last Name', get: (e) => e.personalInformation.lastName },
      { label: 'Mobile Number', get: (e) => e.personalInformation.mobileNumber },
      { label: 'Email Address', get: (e) => e.personalInformation.email },
      { label: 'Date of Birth', get: (e) => formatLongDate(e.personalInformation.dateOfBirth) },
      { label: 'Gender', get: (e) => e.personalInformation.gender },
      { label: 'Nationality', get: (e) => e.personalInformation.nationality },
      { label: 'Marital Status', get: (e) => e.personalInformation.maritalStatus },
      { label: 'Aadhaar Number', get: (e) => e.personalInformation.aadhaarNumber },
    ],
  },
  {
    title: 'Address Information',
    fields: [
      { label: 'Current Address', get: (e) => e.personalInformation.currentAddress },
      { label: 'Current City', get: (e) => e.personalInformation.currentCity },
      { label: 'Current District', get: (e) => e.personalInformation.currentDistrict },
      { label: 'Current State', get: (e) => e.personalInformation.currentState },
      { label: 'Current PIN Code', get: (e) => e.personalInformation.currentPinCode },
      { label: 'Permanent Address', get: (e) => e.personalInformation.permanentAddress },
      { label: 'Permanent City', get: (e) => e.personalInformation.permanentCity },
      { label: 'Permanent District', get: (e) => e.personalInformation.permanentDistrict },
      { label: 'Permanent State', get: (e) => e.personalInformation.permanentState },
      { label: 'Permanent PIN Code', get: (e) => e.personalInformation.permanentPinCode },
    ],
  },
  {
    title: 'Emergency Contact Details',
    fields: [
      { label: 'Emergency Contact Name', get: (e) => e.personalInformation.emergencyContactName },
      { label: 'Relationship', get: (e) => e.personalInformation.emergencyRelationship },
      { label: 'Emergency Phone Number', get: (e) => e.personalInformation.emergencyPhoneNumber },
      { label: 'Emergency Address', get: (e) => e.personalInformation.emergencyAddress, fullWidth: true },
    ],
  },
];

const professionalSections: SectionConfig[] = [
  {
    title: 'Employment Details',
    fields: [
      { label: STRINGS.EMPLOYEE_ID, get: (e) => e.employeeId },
      { label: STRINGS.EMPLOYEE_TYPE, get: (e) => e.professionalInformation.employeeType },
      { label: STRINGS.EMPLOYMENT_STATUS, get: (e) => e.professionalInformation.employmentStatus },
      { label: 'Date of Joining', get: (e) => formatLongDate(e.professionalInformation.dateOfJoining) },
      { label: STRINGS.DEPARTMENT, get: (e) => e.professionalInformation.department },
      { label: STRINGS.DESIGNATION, get: (e) => e.professionalInformation.designation },
      { label: 'Work Mode', get: (e) => e.professionalInformation.workMode },
    ],
  },
];

const payrollSections: SectionConfig[] = [
  {
    title: 'Bank Account Details',
    fields: [
      { label: 'Account Holder Name', get: (e) => e.payrollInformation.accountHolderName },
      { label: 'Bank Name', get: (e) => e.payrollInformation.bankName },
      { label: 'Account Number', get: (e) => e.payrollInformation.accountNumber },
      { label: 'IFSC Code', get: (e) => e.payrollInformation.ifscCode },
      { label: 'Branch Name', get: (e) => e.payrollInformation.branchName },
    ],
  },
  {
    title: 'Statutory Details',
    fields: [
      { label: 'PAN Number', get: (e) => e.payrollInformation.panNumber },
      { label: 'UAN Number', get: (e) => e.payrollInformation.uanNumber },
      { label: 'ESIC Number', get: (e) => e.payrollInformation.esicNumber },
    ],
  },
];

/**
 * Keyed by step id rather than by index so the two stay in sync if `STEPS` is reordered.
 * Documents have no read endpoint yet, hence the empty section list and its empty state.
 */
const SECTIONS_BY_STEP: Record<(typeof STEPS)[number]['id'], SectionConfig[]> = {
  'personal-information': personalSections,
  'professional-information': professionalSections,
  'payroll-information': payrollSections,
  'documents': [],
};

interface DetailItem {
  label: string;
  value: string;
  fullWidth?: boolean;
}

interface DetailSection {
  title: string;
  fields: DetailItem[];
}

/**
 * Resolves a step's configured fields against the record. Only the visible step is
 * resolved, so switching steps costs one pass over that step's fields and nothing more.
 */
function buildSections(sections: SectionConfig[], employee: EmployeeDetail): DetailSection[] {
  return sections.map((section) => ({
    title: section.title,
    fields: section.fields.map((field) => ({
      label: field.label,
      value: field.get(employee) || EMPTY_VALUE,
      fullWidth: field.fullWidth,
    })),
  }));
}

export default function EmployeeDetails({ employee }: EmployeeDetailsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const sections = useMemo(
    () => buildSections(SECTIONS_BY_STEP[STEPS[currentStep].id], employee),
    [currentStep, employee]
  );

  return (
    <div className={styles.container}>
      <AppHeader
        title={employee.name}
        breadcrumbs={[{ label: STRINGS.ALL_EMPLOYEES, href: ROUTES.EMPLOYEES }, { label: employee.name }]}
      />

      <div className={styles.content}>
        <EmployeeProfileHeader employee={employee} />

        <div className={styles.subContent}>
          <EmployeeProfileSidebar />

          <div className={styles.detailsContent}>
            <Stepper currentStep={currentStep} steps={STEPS} onStepChange={setCurrentStep} />

            <EmployeeInfoSection data={sections} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmployeeProfileHeaderProps {
  employee: EmployeeDetail;
}

function EmployeeProfileHeader({ employee }: EmployeeProfileHeaderProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`${ROUTES.EMPLOYEES}/${employee.id}/edit`);
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.employeeInfo}>
        <img src={employee.avatar} alt={employee.name} className={styles.avatar} />

        <div className={styles.details}>
          <Heading5>{employee.name}</Heading5>

          <div className={styles.columnContainer}>
            <div className={styles.metaItem}>
              <BriefcaseBusiness size={24} />
              <Text4>{employee.professionalInformation.designation}</Text4>
            </div>

            <div className={styles.metaItem}>
              <Phone size={24} />
              <Text4>{employee.personalInformation.mobileNumber}</Text4>
            </div>
          </div>
        </div>
      </div>

      <Button startIcon={PencilLine} onClick={handleEdit}>
        {STRINGS.EDIT_PROFILE}
      </Button>
    </div>
  );
}

export const profileItems = [
  {
    label: STRINGS.PROFILE,
    icon: UserRound,
  },
  {
    label: STRINGS.SEPARATION,
    icon: LogOut,
  },
];

function EmployeeProfileSidebar() {
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

interface EmployeeInfoSectionProps {
  data: DetailSection[];
}

function EmployeeInfoSection({ data }: EmployeeInfoSectionProps) {
  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text2>{STRINGS.NO_DOCUMENTS_UPLOADED}</Text2>
      </div>
    );
  }

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
