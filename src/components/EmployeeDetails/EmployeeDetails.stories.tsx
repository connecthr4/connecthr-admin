import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import EmployeeDetails from './EmployeeDetails';
import type { EmployeeDetail } from '@/src/lib/types/employees';

const employee: EmployeeDetail = {
  id: 'cmsfjdo8a00005vp2g0qavnkj',
  employeeId: 'EMP1001',
  avatar: 'https://i.pravatar.cc/150?img=1',
  name: 'Katrina Flores',
  personalInformation: {
    firstName: 'Katrina',
    lastName: 'Flores',
    mobileNumber: '9100000000',
    email: 'katrina.flores0@example.com',
    dateOfBirth: '1985-06-01',
    gender: 'Other',
    nationality: 'Indian',
    maritalStatus: 'Widowed',
    aadhaarNumber: '200000000000',
    currentAddress: '277 Park Avenue',
    currentCity: 'Bengaluru',
    currentState: 'Karnataka',
    currentDistrictCode: '525',
    currentDistrict: 'Bengaluru Urban',
    currentPinCode: '560001',
    permanentAddress: '57 MG Road',
    permanentCity: 'Gurugram',
    permanentState: 'Haryana',
    permanentDistrictCode: '62',
    permanentDistrict: 'Gurugram',
    permanentPinCode: '122001',
    emergencyContactName: 'Darrell Flores',
    emergencyRelationship: 'Sibling',
    emergencyPhoneNumber: '8100000000',
    emergencyAddress: '114 Brigade Road, Bengaluru',
  },
  professionalInformation: {
    employeeType: 'Full Time',
    employmentStatus: 'On Notice',
    dateOfJoining: '2017-01-11',
    department: 'PM',
    designation: 'Associate Project Manager',
    workMode: 'Hybrid',
  },
  payrollInformation: {
    accountHolderName: 'Katrina Flores',
    bankName: 'Axis Bank',
    accountNumber: '5000000000000000',
    ifscCode: 'UTIB0133800',
    branchName: 'Bengaluru Branch',
    panNumber: 'ABCDE1000F',
    uanNumber: '100000000000',
    esicNumber: '3000000000',
  },
  createdAt: '2026-08-05T03:37:38.795Z',
  updatedAt: '2026-08-05T03:37:38.795Z',
};

const meta = {
  title: 'components/EmployeeDetails',
  component: EmployeeDetails,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    employee,
  },
} satisfies Meta<typeof EmployeeDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
