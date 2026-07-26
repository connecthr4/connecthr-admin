/**
 * A modal component for creating and adding new holidays to the holiday management system.
 *
 * @example
 * ```tsx
 * import AddHolidayModal from '@src/components/AddHolidayModal'
 *
 * export default function AddHolidayModal() {
 *   return <AddHolidayModal label="Hello" />;
 * }
 * ```
 */

import { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import TextInput from '../TextInput';
import { Text1 } from '../Typography';
import DatePicker from '../DatePicker';
import { STRINGS } from '@/src/constants/strings';
import type { CreateHolidayRequest } from '@/src/lib/types/holidays';
import styles from './AddHolidayModal.module.scss';

/**
 * Define the props available for the AddHolidayModal component.
 */
interface AddHolidayModalProps {
  isOpen: boolean;
  onclose: () => void;
  isSubmitting?: boolean;
  onSubmit: (data: CreateHolidayRequest) => void;
}

export default function AddHolidayModal({ isOpen, onclose, onSubmit, isSubmitting = false }: AddHolidayModalProps) {
  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear, 0, 1);
  const maxDate = new Date(currentYear, 11, 31);

  const [formData, setFormData] = useState({
    name: '',
    date: undefined as string | undefined,
  });
  const [errors, setErrors] = useState({
    name: '',
    date: '',
  });

  const handleSubmit = () => {
    const newErrors = {
      name: '',
      date: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = STRINGS.HOLIDAY_NAME_IS_REQUIRED;
    }

    if (!formData.date) {
      newErrors.date = STRINGS.HOLIDAY_DATE_IS_REQUIRED;
    }

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors || !formData.date) return;

    onSubmit({ name: formData.name, date: formData.date });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onclose}
      title={STRINGS.ADD_NEW_HOLIDAY}
      closeOnOverlayClick={!isSubmitting}
      centered
      className={styles.modal}
    >
      <div className={styles.inputContainer}>
        <TextInput
          label={STRINGS.HOLIDAY_NAME}
          required
          placeholder={STRINGS.HOLIDAY_NAME_PLACEHOLDER}
          value={formData?.name}
          error={errors.name}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              name: e.target.value,
            }));

            if (errors.name) {
              setErrors((prev) => ({
                ...prev,
                name: '',
              }));
            }
          }}
        />
        <DatePicker
          displayMode="modal"
          label={STRINGS.SELECT_DATE}
          required
          value={formData?.date}
          error={errors.date}
          minDate={minDate}
          maxDate={maxDate}
          onChange={(date) => {
            const selectedDate = typeof date === 'string' && date ? date : undefined;
            setFormData((prev) => ({
              ...prev,
              date: selectedDate,
            }));

            if (errors.date) {
              setErrors((prev) => ({
                ...prev,
                date: '',
              }));
            }
          }}
        />
      </div>
      <div className={styles.buttonContainer}>
        <Button variant="secondary" className={styles.add} onClick={onclose} disabled={isSubmitting}>
          <Text1>{STRINGS.CANCEL}</Text1>
        </Button>
        <Button variant="primary" className={styles.add} onClick={handleSubmit} loading={isSubmitting}>
          <Text1>{STRINGS.ADD}</Text1>
        </Button>
      </div>
    </Modal>
  );
}
