/**
 * A dashboard component for displaying, managing, and tracking all company holiday records in a centralized view.
 *
 * @example
 * ```tsx
 * import HolidaysDashboard from '@src/components/HolidaysDashboard'
 *
 * export default function HolidaysDashboard() {
 *   return <HolidaysDashboard label="Hello" />;
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import Button from '../Button';
import AppHeader from '../AppHeader';
import { Heading3 } from '../Typography';
import { logger } from '@/src/lib/logger';
import { CirclePlus, Download } from 'lucide-react';
import AddHolidayModal from '../AddHolidayModal';
import ExportConfirmationModal from '../ExportConfirmationModal';
import HolidayMonthCard from '../HolidayMonthCard';
import { getApiErrorInfo } from '@/src/lib/api/helpers';
import { HolidaysClient } from '@/src/lib/api/holidaysClient';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import { useNotification } from '@/src/providers/NotificationProvider';
import { CreateHolidayRequest, HolidayMonthGroup } from '@/src/lib/types/holidays';
import styles from './HolidaysDashboard.module.scss';

/**
 * Define the props available for the HolidaysDashboard component.
 */
interface HolidaysDashboardProps {
  initialHolidaysList: HolidayMonthGroup[];
}

export default function HolidaysDashboard({ initialHolidaysList }: HolidaysDashboardProps) {
  const { showNotification } = useNotification();
  const [holidaysList, setHolidaysList] = useState(initialHolidaysList);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleHolidaySubmit = async (data: CreateHolidayRequest) => {
    setIsSubmitting(true);

    try {
      await HolidaysClient.createHoliday(data);
      const response = await HolidaysClient.getHolidaysList();
      setHolidaysList(response.data);
      setIsAddHolidayModalOpen(false);
      showNotification(STRINGS.HOLIDAY_CREATED_SUCCESSFULLY, '', NOTIFICATION_TYPES.SUCCESS, 5000, 'top-right', false);
    } catch (error) {
      logger.error('Error occurred while creating holiday:', error);
      const { message } = getApiErrorInfo(error);
      showNotification(STRINGS.HOLIDAY_CREATION_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    setDeletingId(id);

    try {
      await HolidaysClient.deleteHoliday({ id });
      const response = await HolidaysClient.getHolidaysList();
      setHolidaysList(response.data);
      showNotification(STRINGS.HOLIDAY_DELETED_SUCCESSFULLY, '', NOTIFICATION_TYPES.SUCCESS, 5000, 'top-right', false);
    } catch (error) {
      logger.error('Error occurred while deleting holiday:', error);
      const { message } = getApiErrorInfo(error);
      showNotification(STRINGS.HOLIDAY_DELETION_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportHolidays = async () => {
    setIsExporting(true);

    try {
      await HolidaysClient.exportHolidays();
      setIsExportModalOpen(false);
      showNotification(
        STRINGS.HOLIDAYS_EXPORTED_SUCCESSFULLY,
        '',
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    } catch (error) {
      logger.error('Error occurred while exporting holidays:', error);
      const { message } = getApiErrorInfo(error);
      showNotification(STRINGS.HOLIDAYS_EXPORT_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <AppHeader title={STRINGS.HOLIDAYS} subtitle={STRINGS.ALL_HOLIDAY_LISTS} />

        <div className={styles.content}>
          <div className={styles.topBar}>
            <Heading3>{STRINGS.YEAR}</Heading3>

            <div className={styles.actions}>
              <Button
                variant="secondary"
                startIcon={Download}
                iconSize={20}
                className={styles.button}
                onClick={() => setIsExportModalOpen(true)}
              >
                {STRINGS.EXPORT}
              </Button>

              <Button
                startIcon={CirclePlus}
                iconSize={24}
                className={styles.button}
                onClick={() => setIsAddHolidayModalOpen(true)}
              >
                {STRINGS.ADD_NEW_HOLIDAY}
              </Button>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {holidaysList.map((monthData) => (
              <HolidayMonthCard
                key={monthData.month}
                month={monthData.month}
                holidays={monthData.holidays}
                onDelete={handleDeleteHoliday}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      </div>

      {isAddHolidayModalOpen && (
        <AddHolidayModal
          isOpen={isAddHolidayModalOpen}
          onclose={() => setIsAddHolidayModalOpen(false)}
          onSubmit={handleHolidaySubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {isExportModalOpen && (
        <ExportConfirmationModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportHolidays}
          description={STRINGS.EXPORT_HOLIDAYS_CONFIRMATION}
          isExporting={isExporting}
        />
      )}
    </>
  );
}
