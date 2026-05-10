import StatsSummaryCard from '../components/StatsSummaryCard';
import { Users, CalendarCheck, CalendarMinus } from 'lucide-react';
import UpcomingHolidaysCard from '../components/UpcomingHolidaysCard';

export default function Home() {
  // const dashboardStats = [
  //   {
  //     id: 1,
  //     title: 'Total Employee',
  //     value: 560,
  //     updatedDate: 'July 16, 2023',
  //     icon: <Users height={20} width={20} color="#7152F3" />,
  //   },
  //   {
  //     id: 2,
  //     title: 'Today Attendance',
  //     value: 1050,
  //     updatedDate: 'July 14, 2023',
  //     icon: <CalendarCheck height={20} width={20} color="#7152F3" />,
  //   },
  //   {
  //     id: 3,
  //     title: 'Today On Leave',
  //     value: 470,
  //     updatedDate: 'July 15, 2023',
  //     icon: <CalendarMinus height={20} width={20} color="#7152F3" />,
  //   },
  // ];
  return (
    // <div
    //   style={{
    //     display: 'grid',
    //     gridTemplateColumns: 'repeat(3, 1fr)',
    //     gap: '20px',
    //   }}
    // >
    //   {dashboardStats.map((item) => (
    //     <StatsSummaryCard
    //       key={item.id}
    //       title={item.title}
    //       value={item.value}
    //       updatedDate={item.updatedDate}
    //       icon={item.icon}
    //     />
    //   ))}
    // </div>

    <div style={{ padding: 24, background: '#f3f4f6' }}>
      <UpcomingHolidaysCard />
    </div>
  );
}
