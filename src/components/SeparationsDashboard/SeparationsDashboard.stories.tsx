import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SeparationsDashboard from './SeparationsDashboard';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';
import type { SeparationListItem, SeparationListMeta } from '@/src/lib/types/separation';

const currentUser: User = {
  id: 'clx-current',
  name: 'Shailesh',
  email: 'shailesh@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

/**
 * Rows shaped exactly as `GET /separations` returns them — the employee nested, the status
 * paired with its served label, and no reason or notes, which only the detail read carries.
 */
const separations: SeparationListItem[] = [
  {
    id: 'cmex7z9c00000ab12cd34efgh',
    employee: {
      id: 'cmeq1a2b30000zz98yy76xxww',
      employeeId: 'EMP1042',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?img=1',
      department: 'Engineering',
      designation: 'Senior Engineer',
    },
    status: 'PENDING',
    statusLabel: 'Pending Approval',
    separationType: 'RESIGNATION',
    separationTypeLabel: 'Resignation',
    resignationDate: '2026-09-20',
    lastWorkingDate: '2026-10-20',
    noticePeriodDays: 30,
    raisedAt: '2026-09-20T09:30:00.000Z',
    decidedAt: null,
    permissions: { canDecide: true, canWithdraw: false },
  },
  {
    id: 'cmex8k1d70001bc23de45fghi',
    employee: {
      id: 'cmeq4d5e60002aa11bb22cc33',
      employeeId: 'EMP1007',
      name: 'Rahul Menon',
      /* No photo on file and no designation recorded — both nullable on this endpoint. */
      avatar: null,
      department: 'Sales',
      designation: null,
    },
    status: 'APPROVED',
    statusLabel: 'Approved',
    separationType: 'RESIGNATION',
    separationTypeLabel: 'Resignation',
    resignationDate: '2026-09-01',
    lastWorkingDate: '2026-09-30',
    noticePeriodDays: 29,
    raisedAt: '2026-09-01T06:12:00.000Z',
    decidedAt: '2026-09-02T11:05:00.000Z',
    permissions: { canDecide: false, canWithdraw: false },
  },
  {
    id: 'cmex9m2e80002cd34ef56ghij',
    employee: {
      id: 'cmeq7g8h90003bb22cc33dd44',
      employeeId: 'EMP1099',
      name: 'Neha Kulkarni',
      avatar: 'https://i.pravatar.cc/150?img=24',
      department: 'Finance',
      designation: 'Analyst',
    },
    status: 'REJECTED',
    statusLabel: 'Rejected',
    separationType: 'RESIGNATION',
    separationTypeLabel: 'Resignation',
    resignationDate: '2026-08-14',
    lastWorkingDate: '2026-09-13',
    noticePeriodDays: 30,
    raisedAt: '2026-08-14T10:02:00.000Z',
    decidedAt: '2026-08-16T08:44:00.000Z',
    permissions: { canDecide: false, canWithdraw: false },
  },
  {
    id: 'cmexan3f90003de45fg67hijk',
    employee: {
      id: 'cmeqab9c00004cc33dd44ee55',
      employeeId: 'EMP1120',
      name: 'Imran Qureshi',
      avatar: 'https://i.pravatar.cc/150?img=68',
      department: 'Operations',
      designation: 'Coordinator',
    },
    status: 'WITHDRAWN',
    statusLabel: 'Withdrawn',
    separationType: 'END_OF_CONTRACT',
    separationTypeLabel: 'End of Contract',
    resignationDate: '2026-07-30',
    lastWorkingDate: '2026-08-29',
    noticePeriodDays: 30,
    raisedAt: '2026-07-30T12:15:00.000Z',
    decidedAt: '2026-08-02T09:00:00.000Z',
    permissions: { canDecide: false, canWithdraw: false },
  },
];

const meta_: SeparationListMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 37,
  totalPages: 4,
  hasNextPage: true,
  hasPreviousPage: false,
};

const meta = {
  title: 'components/SeparationsDashboard',
  component: SeparationsDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    initialSeparations: separations,
    initialMeta: meta_,
    currentUser,
  },
} satisfies Meta<typeof SeparationsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The first page, with all four statuses represented.
 *
 * Opening a row calls the detail Server Function, which is not available in Storybook — the
 * drawer will show its error state with a retry, which is itself worth seeing.
 */
export const Default: Story = {};

/**
 * Before anything has been filed.
 */
export const Empty: Story = {
  args: {
    initialSeparations: [],
    initialMeta: { ...meta_, totalItems: 0, totalPages: 0, hasNextPage: false },
  },
};

/**
 * The decision flow end to end, against a decide call that always succeeds.
 *
 * Open EMP1042 — the one pending row this user may decide — and the drawer's footer offers
 * Approve and Reject. Either hands over to the confirmation, and confirming moves the row's
 * badge without the list being re-read. The other three rows are already decided or
 * withdrawn, so they open with no footer at all.
 *
 * Worth trying both ways round: approving takes one click, while rejecting will not go
 * through until a reason has been given, which is what the two endpoints ask for.
 *
 * The delay is there to be seen — it is the window in which both buttons and the reason field
 * are locked, since a decision recorded twice is not something an approver can undo.
 */
export const Decidable: Story = {
  args: {
    onDecide: async (_separationId, outcome, remarks) => {
      await new Promise((resolve) => setTimeout(resolve, 900));

      return {
        success: true,
        message: remarks ?? (outcome === 'APPROVED' ? 'Separation approved.' : 'Separation rejected.'),
      };
    },
  },
};

/**
 * The same flow when the backend refuses — a decision another approver got to first, say, or
 * a 403 for a separation the approver raised themselves.
 *
 * The confirmation stays open and the row does not move: the approver is told what happened,
 * in the API's own words, while still looking at the decision they were making.
 */
export const DecisionRefused: Story = {
  args: {
    onDecide: async () => ({
      success: false,
      message: 'This separation has already been decided.',
    }),
  },
};
