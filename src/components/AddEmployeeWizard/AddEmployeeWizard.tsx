/**
 * A multi-step wizard component responsible for managing the employee creation workflow, including step navigation, form state management, validation, and employee data submission.
 *
 * @example
 * ```tsx
 * import AddEmployeeWizard from '@src/components/AddEmployeeWizard'
 *
 * export default function AddEmployeeWizard() {
 *   return <AddEmployeeWizard label="Hello" />;
 * }
 * ```
 */

import styles from './AddEmployeeWizard.module.scss';

/**
 * Define the props available for the AddEmployeeWizard component.
 */
interface AddEmployeeWizardProps {
  label?: string;
}

export default function AddEmployeeWizard({ label = 'label' }: AddEmployeeWizardProps) {
  return (
    <div className={styles.container}>
      AddEmployeeWizard component - {label}
    </div>
  );
}
