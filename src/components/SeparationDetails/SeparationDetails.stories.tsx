import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SeparationDetails from './SeparationDetails';

import type { SeparationDetail, SeparationListItem } from '@/src/lib/types/separation';

const summary: SeparationListItem = {
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
};

const detail: SeparationDetail = {
  ...summary,
  employee: { ...summary.employee, employmentStatus: 'ACTIVE' },
  reason: 'Relocating to another city.',
  notes: 'Knowledge transfer to be completed by 10 Oct.',
  raisedBy: { id: 'cmus1111', name: 'Anita Rao', role: 'ADMIN' },
  decision: null,
};

const meta = {
  title: 'components/SeparationDetails',
  component: SeparationDetails,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    summary,
    detail,
    isLoading: false,
    error: null,
  },
} satisfies Meta<typeof SeparationDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A complete submission, once the detail read has landed.
 */
export const Default: Story = {};

/**
 * How the drawer looks the instant it opens: everything the list row carries is already
 * drawn, and only the reason, the notes and who raised it are still on their way.
 */
export const Loading: Story = {
  args: {
    detail: null,
    isLoading: true,
  },
};

/**
 * The detail read failed. What the row supplied stays on screen, and only the fields that
 * needed the read are replaced — with the backend's own wording and a retry.
 */
export const DetailFailed: Story = {
  args: {
    detail: null,
    error: 'Separation not found.',
  },
};

/**
 * Filed without the optional notes — the notes row is dropped rather than left empty.
 */
export const WithoutNotes: Story = {
  args: {
    detail: { ...detail, notes: null },
  },
};

/**
 * An employee with no photo on file. Both endpoints return `avatar: null` for those, so the
 * placeholder is the normal case rather than an error.
 */
export const WithoutPhoto: Story = {
  args: {
    summary: { ...summary, employee: { ...summary.employee, avatar: null, designation: null } },
    detail: {
      ...detail,
      employee: { ...detail.employee, avatar: null, designation: null },
    },
  },
};

/**
 * A decided separation. The record carries a decision, but the panel shows only what was
 * filed — the badge is the whole of where it stands.
 */
export const Approved: Story = {
  args: {
    summary: { ...summary, status: 'APPROVED', statusLabel: 'Approved', decidedAt: '2026-09-22T11:05:00.000Z' },
    detail: {
      ...detail,
      status: 'APPROVED',
      statusLabel: 'Approved',
      decision: {
        statusLabel: 'Approved',
        decidedBy: { id: 'cmus2222', name: 'Vikram Rao', role: 'ADMIN' },
        decidedAt: '2026-09-22T11:05:00.000Z',
        comment: 'Handover plan accepted.',
      },
    },
  },
};

/**
 * A reason long enough to wrap, which is why the panel shows it as a paragraph.
 */
export const LongReason: Story = {
  args: {
    detail: {
      ...detail,
      reason:
        'Returning to full-time study for a postgraduate programme that begins in January, and the course schedule cannot be combined with the current role or with any reduced-hours arrangement discussed so far.',
    },
  },
};
