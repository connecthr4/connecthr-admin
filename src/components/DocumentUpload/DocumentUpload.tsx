/**
 * The final step of the employee wizard, where an employee's supporting documents are uploaded.
 *
 * @remarks
 * The picked files are held in the employee store alongside the rest of the wizard draft —
 * there is no upload endpoint yet, so nothing leaves the browser until one exists. Wiring
 * this step to remote storage later means changing what `setDocument` is handed, not this
 * layout.
 *
 * @example
 * ```tsx
 * import DocumentUpload from '@src/components/DocumentUpload'
 *
 * export default function DocumentUpload() {
 *   return <DocumentUpload onSubmit={handleSubmit} onBack={handleBack} />;
 * }
 * ```
 */
'use client';

import Button from '../Button';
import FileDropzone from '../FileDropzone';
import { DOCUMENT_FIELDS } from '@/src/constants/strings';
import { useEmployeeStore } from '@/src/store/employeeStore';
import styles from './DocumentUpload.module.scss';

/**
 * Define the props available for the DocumentUpload component.
 */
interface DocumentUploadProps {
  /**
   * Callback fired when the step is submitted.
   */
  onSubmit: () => void;

  /**
   * Callback fired when the user returns to the previous step.
   */
  onBack: () => void;

  /**
   * Label rendered on the submit button.
   *
   * @default "Create Employee"
   */
  submitLabel?: string;

  /**
   * While `true` the submit button shows a spinner and both actions are locked, so the
   * create request cannot be fired twice.
   */
  isSubmitting?: boolean;
}

export default function DocumentUpload({
  onSubmit,
  onBack,
  submitLabel = 'Create Employee',
  isSubmitting = false,
}: DocumentUploadProps) {
  /*
    Two narrow selections rather than one over the whole store: `documents` is replaced
    wholesale on every change, and `setDocument` never is, so the step re-renders once per
    pick and not at all when another step is saved.
  */
  const documents = useEmployeeStore((state) => state.documents);
  const setDocument = useEmployeeStore((state) => state.setDocument);

  /*
    The other wizard steps are DynamicForms, so they submit through a real form element and
    the Enter key works. Keeping that shape here means this step behaves the same way.
  */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit();
  };

  return (
    <form noValidate data-testid="DocumentUploadTest" className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.content}>
        {DOCUMENT_FIELDS.map(({ id, label }) => (
          <FileDropzone
            key={id}
            label={label}
            file={documents[id]}
            disabled={isSubmitting}
            onChange={(file) => setDocument(id, file)}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onBack}>
          Back
        </Button>

        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
