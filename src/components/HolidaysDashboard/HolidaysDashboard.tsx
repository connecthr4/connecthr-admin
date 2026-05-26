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
import AppHeader from '../AppHeader';
import Button from '../Button';
import { Heading3, Text1 } from '../Typography';
import styles from './HolidaysDashboard.module.scss';
import { CirclePlus } from 'lucide-react';
import Modal from '../Modal';
import DatePicker from '../DatePicker';
import TextInput from '../TextInput';
import AddHolidayModal from '../AddHolidayModal';
import HolidayMonthCard from '../HolidayMonthCard';

/**
 * Define the props available for the HolidaysDashboard component.
 */
interface HolidaysDashboardProps {
  label?: string;
}

interface HolidayFormData {
  holidayName: string;
  holidayDate: Date | undefined;
}

export default function HolidaysDashboard({ label = 'label' }: HolidaysDashboardProps) {
  const holidaysByMonth = [
    {
      month: 'January',
      holidays: [
        {
          id: '1',
          name: "New Year's Day",
          date: 'Jan 01',
          day: 'Wednesday',
        },
        {
          id: '2',
          name: 'Pongal',
          date: 'Jan 14',
          day: 'Tuesday',
        },
        {
          id: '3',
          name: 'Republic Day',
          date: 'Jan 26',
          day: 'Sunday',
        },
      ],
    },

    {
      month: 'February',
      holidays: [
        {
          id: '4',
          name: 'Mahashivratri',
          date: 'Feb 26',
          day: 'Wednesday',
        },
      ],
    },

    {
      month: 'March',
      holidays: [
        {
          id: '5',
          name: 'Holi',
          date: 'Mar 14',
          day: 'Friday',
        },
        {
          id: '6',
          name: 'Good Friday',
          date: 'Mar 28',
          day: 'Friday',
        },
      ],
    },

    {
      month: 'April',
      holidays: [
        {
          id: '7',
          name: 'Ugadi',
          date: 'Apr 09',
          day: 'Wednesday',
        },
        {
          id: '8',
          name: 'Ram Navami',
          date: 'Apr 17',
          day: 'Thursday',
        },
        {
          id: '9',
          name: 'Ambedkar Jayanti',
          date: 'Apr 14',
          day: 'Monday',
        },
        {
          id: '10',
          name: 'Mahavir Jayanti',
          date: 'Apr 21',
          day: 'Monday',
        },
        {
          id: '11',
          name: 'Hanuman Jayanti',
          date: 'Apr 23',
          day: 'Wednesday',
        },
        {
          id: '12',
          name: 'Eid-ul-Fitr',
          date: 'Apr 30',
          day: 'Wednesday',
        },
      ],
    },

    {
      month: 'May',
      holidays: [],
    },

    {
      month: 'June',
      holidays: [
        {
          id: '13',
          name: 'Bakrid',
          date: 'Jun 17',
          day: 'Tuesday',
        },
      ],
    },

    {
      month: 'July',
      holidays: [],
    },

    {
      month: 'August',
      holidays: [
        {
          id: '14',
          name: 'Independence Day',
          date: 'Aug 15',
          day: 'Friday',
        },
        {
          id: '15',
          name: 'Raksha Bandhan',
          date: 'Aug 19',
          day: 'Tuesday',
        },
        {
          id: '16',
          name: 'Janmashtami',
          date: 'Aug 26',
          day: 'Tuesday',
        },
      ],
    },

    {
      month: 'September',
      holidays: [
        {
          id: '17',
          name: 'Ganesh Chaturthi',
          date: 'Sep 07',
          day: 'Sunday',
        },
        {
          id: '18',
          name: 'Onam',
          date: 'Sep 15',
          day: 'Monday',
        },
      ],
    },

    {
      month: 'October',
      holidays: [
        {
          id: '19',
          name: 'Gandhi Jayanti',
          date: 'Oct 02',
          day: 'Thursday',
        },
        {
          id: '20',
          name: 'Dussehra',
          date: 'Oct 12',
          day: 'Sunday',
        },
        {
          id: '21',
          name: 'Karwa Chauth',
          date: 'Oct 20',
          day: 'Monday',
        },
        {
          id: '22',
          name: 'Diwali',
          date: 'Oct 29',
          day: 'Wednesday',
        },
        {
          id: '23',
          name: 'Bhai Dooj',
          date: 'Oct 31',
          day: 'Friday',
        },
        {
          id: '24',
          name: 'Chhath Puja',
          date: 'Oct 31',
          day: 'Friday',
        },
        {
          id: '25',
          name: 'Valmiki Jayanti',
          date: 'Oct 17',
          day: 'Friday',
        },
        {
          id: '26',
          name: 'Maharishi Day',
          date: 'Oct 22',
          day: 'Wednesday',
        },
      ],
    },

    {
      month: 'November',
      holidays: [
        {
          id: '27',
          name: 'Guru Nanak Jayanti',
          date: 'Nov 05',
          day: 'Wednesday',
        },
        {
          id: '28',
          name: 'Children’s Day',
          date: 'Nov 14',
          day: 'Friday',
        },
      ],
    },

    {
      month: 'December',
      holidays: [
        {
          id: '29',
          name: 'Christmas',
          date: 'Dec 25',
          day: 'Thursday',
        },
        {
          id: '30',
          name: 'New Year Eve',
          date: 'Dec 31',
          day: 'Wednesday',
        },
      ],
    },
  ];

  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  const handleHolidaySubmit = (data: HolidayFormData) => {
    console.log(data);

    console.log(data.holidayName);
    console.log(data.holidayDate);

    setIsAddHolidayModalOpen(false);
  };

  const handleDeleteHoliday = (id: string) => {
    console.log('Delete holiday:', id);
  };

  return (
    <>
      <div className={styles.container}>
        <AppHeader title="Holidays" subtitle="All Holiday Lists" />

        <div className={styles.content}>
          <div className={styles.topBar}>
            <Heading3>Year - 2026</Heading3>

            <Button
              startIcon={CirclePlus}
              iconSize={24}
              className={styles.button}
              onClick={() => setIsAddHolidayModalOpen(true)}
            >
              Add New Holiday
            </Button>
          </div>

          <div className={styles.cardsGrid}>
            {holidaysByMonth.map((monthData) => (
              <HolidayMonthCard
                key={monthData.month}
                month={monthData.month}
                holidays={monthData.holidays}
                onDelete={handleDeleteHoliday}
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
        />
      )}
    </>
  );
}
