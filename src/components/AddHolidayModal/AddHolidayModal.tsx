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
import Button from '../Button';
import DatePicker from '../DatePicker';
import Modal from '../Modal';
import TextInput from '../TextInput';
import styles from './AddHolidayModal.module.scss';
import { Text1 } from '../Typography';

interface HolidayFormData {
  holidayName: string;
  holidayDate: Date | undefined;
}

/**
 * Define the props available for the AddHolidayModal component.
 */
interface AddHolidayModalProps {
  isOpen: boolean;
  onclose: () => void;
  onSubmit: (data: HolidayFormData) => void;
}

export default function AddHolidayModal({ isOpen, onclose, onSubmit }: AddHolidayModalProps) {
  const [formData, setFormData] = useState({
    holidayName: '',
    holidayDate: undefined as Date | undefined,
  });
  const [errors, setErrors] = useState({
    holidayName: '',
    holidayDate: '',
  });

  const handleSubmit = () => {
    const newErrors = {
      holidayName: '',
      holidayDate: '',
    };

    console.log('formData>>', formData);
    if (!formData.holidayName.trim()) {
      newErrors.holidayName = 'Holiday name is required';
    }

    if (!formData.holidayDate) {
      newErrors.holidayDate = 'Holiday date is required';
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);

    if (hasErrors) return;

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onclose}
      title="Add New Holiday"
      closeOnOverlayClick
      centered
      className={styles.modal}
    >
      <div className={styles.inputContainer}>
        <TextInput
          label="Holiday Name"
          required
          placeholder="Enter Holiday Name"
          value={formData?.holidayName}
          error={errors.holidayName}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              holidayName: e.target.value,
            }));

            if (errors.holidayName) {
              setErrors((prev) => ({
                ...prev,
                holidayName: '',
              }));
            }
          }}
        />
        <DatePicker
          displayMode="modal"
          label="Select Date"
          required
          value={formData?.holidayDate}
          error={errors.holidayDate}
          onChange={(date) => {
            setFormData((prev) => ({
              ...prev,
              holidayDate: date instanceof Date ? date : undefined,
            }));

            if (errors.holidayDate) {
              setErrors((prev) => ({
                ...prev,
                holidayDate: '',
              }));
            }
          }}
        />
      </div>
      <div className={styles.buttonContainer}>
        <Button variant="secondary" className={styles.add} onClick={onclose}>
          <Text1>Cancel</Text1>
        </Button>
        <Button variant="primary" className={styles.add} onClick={handleSubmit}>
          <Text1>Add</Text1>
        </Button>
      </div>
    </Modal>
  );
}
