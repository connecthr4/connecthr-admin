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
import { BriefcaseBusiness, Phone, PencilLine } from 'lucide-react';
import AppHeader from '../AppHeader';
import AppImage from '../AppImage';
import Button from '../Button';
import EmployeeAttendance from '../EmployeeAttendance';
import SeparationDetails from '../SeparationDetails';
import Stepper from '../Stepper';
import { Heading5, Text1, Text2, Text4 } from '../Typography/Typography';
import { useEmployeeAttendance } from '@/src/hooks/useEmployeeAttendance';
import { useEmployeeSeparation } from '@/src/hooks/useEmployeeSeparation';
import { PROFILE_ITEMS, ROUTES, STEPS, STRINGS } from '@/src/constants/strings';
import { formatLongDate } from '@/src/utils/date';
import type { EmployeeSeparationState } from '@/src/hooks/useEmployeeSeparation';
import type { ProfileSectionId } from '@/src/constants/strings';
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
      // The resolved name, not `shiftCode` — "GENERAL" is what the backend stores, "General"
      // is what the user reads.
      { label: 'Shift', get: (e) => e.professionalInformation.shift },
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

  /** Which sidebar section is open — the profile the screen lands on, or the attendance history. */
  const [section, setSection] = useState<ProfileSectionId>(PROFILE_ITEMS[0].id);

  const isAttendanceOpen = section === 'attendance';
  const isSeparationOpen = section === 'separation';

  /*
  Read only once the Attendance section is actually opened, and kept for as long
  as the screen lives: a visit that stays on the profile costs no attendance
  request at all, and switching back and forth costs no further ones.
  */
  const attendance = useEmployeeAttendance(employee.id, isAttendanceOpen);

  /*
  The same bargain for the separation, and on the same terms — but keyed on the
  "EMP1042" code rather than the record id above, because that is what
  `/separations/employee/:employeeId` matches on.
  */
  const separation = useEmployeeSeparation(employee.employeeId, isSeparationOpen);

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
          <EmployeeProfileSidebar selected={section} onSelect={setSection} />

          {/*
          One branch per section rather than a chain of ternaries: only the
          profile carries a stepper, and the other two are each a single panel.
          */}
          <div className={styles.detailsContent}>
            {section === 'profile' && (
              <>
                <Stepper currentStep={currentStep} steps={STEPS} onStepChange={setCurrentStep} />

                <EmployeeInfoSection data={sections} />
              </>
            )}

            {/*
            No stepper above it: the steps belong to the profile's sections,
            and the history is one listing rather than a set of them.
            */}
            {isAttendanceOpen && (
              <div className={styles.attendanceSection}>
                <EmployeeAttendance
                  rows={attendance.rows}
                  isLoading={attendance.isLoading}
                  errorMessage={attendance.errorMessage}
                  onRetry={attendance.reload}
                />
              </div>
            )}

            {isSeparationOpen && (
              <div className={styles.separationSection}>
                <EmployeeSeparationSection separation={separation} />
              </div>
            )}
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

  const editHref = `${ROUTES.EMPLOYEES}/${employee.id}/edit`;

  const handleEdit = () => {
    router.push(editHref);
  };

  /**
   * The edit route is dynamic, so it is never prefetched on its own — only its loading
   * boundary can be, and only when asked. Warming it on hover means the click lands on a
   * shell that is already in the browser, with just the record still streaming in.
   */
  const handleEditIntent = () => {
    router.prefetch(editHref);
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.employeeInfo}>
        <AppImage src={employee.avatar} alt={employee.name} width={110} height={110} className={styles.avatar} />

        <div className={styles.details}>
          <Heading5>{employee.name}</Heading5>

          <div className={styles.columnContainer}>
            <div className={styles.metaItem}>
              <BriefcaseBusiness size={24} />
              <Text4>{employee.professionalInformation.department}</Text4>
            </div>

            <div className={styles.metaItem}>
              <Phone size={24} />
              <Text4>{employee.personalInformation.mobileNumber}</Text4>
            </div>
          </div>
        </div>
      </div>

      <Button startIcon={PencilLine} onClick={handleEdit} onMouseEnter={handleEditIntent} onFocus={handleEditIntent}>
        {STRINGS.EDIT_PROFILE}
      </Button>
    </div>
  );
}

interface EmployeeProfileSidebarProps {
  selected: ProfileSectionId;
  onSelect: (section: ProfileSectionId) => void;
}

/**
 * The section switcher. Controlled rather than holding its own selection: the
 * panel beside it is what the choice actually changes, so the two would
 * otherwise be keeping the same answer in two places.
 */
function EmployeeProfileSidebar({ selected, onSelect }: EmployeeProfileSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.itemContainer}>
        {PROFILE_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={clsx(styles.menuItem, {
                [styles.active]: selected === item.id,
              })}
              onClick={() => onSelect(item.id)}
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

interface EmployeeSeparationSectionProps {
  separation: EmployeeSeparationState;
}

/**
 * The employee's separation, or a line saying there isn't one.
 *
 * The empty state is deliberately not `SeparationDetails`' business: a panel built to show a
 * record has nothing useful to say about the absence of one, and "none filed" is the answer
 * for most employees rather than an edge of this screen. It is also told apart from a failed
 * read — that keeps its error and its retry, which an empty section must not offer.
 */
function EmployeeSeparationSection({ separation }: EmployeeSeparationSectionProps) {
  const hasNoSeparation = !separation.isLoading && !separation.errorMessage && !separation.separation;

  if (hasNoSeparation) {
    return (
      <div className={styles.emptyState}>
        <Text2>{STRINGS.NO_SEPARATION_FILED}</Text2>
      </div>
    );
  }

  return (
    <SeparationDetails
      detail={separation.separation}
      isLoading={separation.isLoading}
      error={separation.errorMessage || null}
      onRetry={separation.reload}
    />
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
