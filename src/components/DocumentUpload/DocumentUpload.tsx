/**
 * The final step of the employee wizard, where an employee&#x27;s supporting documents are uploaded.
 * The upload fields are not built yet, so the step currently renders its actions only.
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
    The other wizard steps are DynamicForms, so they submit through a real form element and
    the Enter key works. Keeping that shape here means the upload fields can be dropped in
    later without the surrounding step having to change.
  */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit();
  };

  return (
    <form noValidate data-testid="DocumentUploadTest" className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.content} />

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
