'use client';

import StatsSummaryCard from '../components/StatsSummaryCard';
import { Users, CalendarCheck, CalendarMinus } from 'lucide-react';
import UpcomingHolidaysCard from '../components/UpcomingHolidaysCard';
import AppHeader from '../components/AppHeader';
import BasePieChart from '../components/BasePieChart';
import LeftNavBar from '../components/LeftNavBar';
import BaseLayout from '../components/BaseLayout';

import { useState } from 'react';
import Modal from '../components/Modal';
import DatePicker from '../components/DatePicker';

export default function Home({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Employee"
        closeOnOverlayClick
        showCloseButton
        centered
      >
        <DatePicker displayMode="modal" />
      </Modal>
    </>
  );
}
