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
import SearchInput from '../components/SearchInput';
import DataTable from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export interface Employee {
  id: string;
  avatar: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  type: 'Office' | 'Remote';
  status: 'Permanent' | 'Contract' | 'Probation';
}

export default function Home({ children }) {
  return <div>Hi</div>;
}
