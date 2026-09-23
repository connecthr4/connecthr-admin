import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SeparationsDashboard from './SeparationsDashboard';
import { getSeparations } from '@/src/lib/actions/separation';
import { SeparationsClient } from '@/src/lib/api/separationClient';
import { STRINGS } from '@/src/constants/strings';

import type { User } from '@/src/lib/types/auth';
import type { SeparationDetail, SeparationListItem, SeparationListMeta } from '@/src/lib/types/separation';

/*
The header chip renders `UserMenu` for real; only its Server Action dependency is stubbed,
since `src/lib/actions/auth` pulls in `server-only` and `next/headers`, neither of which
resolve under jsdom.
*/
vi.mock('@/src/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('@/src/lib/actions/separation', () => ({
  getSeparations: vi.fn(),
}));

vi.mock('@/src/lib/api/separationClient', () => ({
  SeparationsClient: { getSeparation: vi.fn(), invalidate: vi.fn() },
}));

vi.mock('@/src/lib/logger', () => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

const showNotificationMock = vi.fn();

vi.mock('@/src/providers/NotificationProvider', () => ({
  useNotification: () => ({ showNotification: showNotificationMock }),
}));

const currentUser: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  mustChangePassword: false,
};

function makeSeparation(overrides: Partial<SeparationListItem> = {}): SeparationListItem {
  return {
    id: 'sep-1',
    employee: {
      id: 'emp-1',
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
    ...overrides,
  };
}

const separations: SeparationListItem[] = [
  makeSeparation(),
  makeSeparation({
    id: 'sep-2',
    employee: {
      id: 'emp-2',
      employeeId: 'EMP1007',
      name: 'Rahul Menon',
      /* No photo on file, and no designation recorded — both are nullable. */
      avatar: null,
      department: 'Sales',
      designation: null,
    },
    status: 'APPROVED',
    statusLabel: 'Approved',
    resignationDate: '2026-09-01',
    lastWorkingDate: '2026-09-30',
    noticePeriodDays: 29,
    raisedAt: '2026-09-01T06:12:00.000Z',
    decidedAt: '2026-09-02T11:05:00.000Z',
    permissions: { canDecide: false, canWithdraw: false },
  }),
];

const meta: SeparationListMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 37,
  totalPages: 4,
  hasNextPage: true,
  hasPreviousPage: false,
};

const detail: SeparationDetail = {
  ...separations[0],
  employee: { ...separations[0].employee, employmentStatus: 'ACTIVE' },
  reason: 'Relocating to another city.',
  notes: 'Knowledge transfer to be completed by 10 Oct.',
  raisedBy: { id: 'cmus1111', name: 'Anita Rao', role: 'ADMIN' },
  decision: null,
};

const secondDetail: SeparationDetail = {
  ...separations[1],
  employee: { ...separations[1].employee, employmentStatus: 'ACTIVE' },
  reason: 'Contract ended and was not renewed.',
  notes: null,
  raisedBy: { id: 'cmus1111', name: 'Anita Rao', role: 'ADMIN' },
  decision: null,
};

/**
 * The detail each separation id reads back as. Dispatching on the id rather than answering
 * every read with the same record is what lets the stale-response case below tell the two
 * apart at all.
 */
const DETAILS_BY_ID: Record<string, SeparationDetail> = {
  'sep-1': detail,
  'sep-2': secondDetail,
};

function renderDashboard(rows: SeparationListItem[] = separations, listMeta: SeparationListMeta = meta) {
  return render(<SeparationsDashboard initialSeparations={rows} initialMeta={listMeta} currentUser={currentUser} />);
}

function rowFor(employeeId: string) {
  return screen.getByRole('cell', { name: employeeId }).closest('tr') as HTMLTableRowElement;
}

function drawer() {
  return within(screen.getByTestId('DrawerTest'));
}

function openRow(employeeId: string) {
  return within(rowFor(employeeId)).getByRole('button', { name: /View separation details/ });
}

describe('SeparationsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SeparationsClient.getSeparation).mockImplementation((id: string) =>
      Promise.resolve(DETAILS_BY_ID[id] ?? detail)
    );
  });

  describe('layout', () => {
    it('renders the header', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: 'Separations' })).toBeInTheDocument();
      expect(screen.getByText('All separation requests')).toBeInTheDocument();
    });

    it('renders every column header, in the order the list reads in', () => {
      renderDashboard();

      const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);

      expect(headers).toEqual([
        'Employee ID',
        'Employee Name',
        'Resignation Type',
        'Resignation Date',
        'Last Working Date',
        'Current Status',
        'Action',
      ]);
    });
  });

  describe('rows', () => {
    it('renders a row per filed separation', () => {
      renderDashboard();

      expect(screen.getAllByRole('row')).toHaveLength(separations.length + 1);
    });

    it('reads the employee off the nested object the endpoint returns', () => {
      renderDashboard();

      const row = within(rowFor('EMP1042'));

      expect(row.getByText('Priya Sharma')).toBeInTheDocument();
      expect(row.getByText('Resignation')).toBeInTheDocument();
      expect(row.getByText('20 Sept 2026')).toBeInTheDocument();
      expect(row.getByText('20 Oct 2026')).toBeInTheDocument();
    });

    it("renders the backend's status wording rather than the raw code", () => {
      renderDashboard();

      expect(within(rowFor('EMP1042')).getByText('Pending Approval')).toBeInTheDocument();
      expect(within(rowFor('EMP1007')).getByText('Approved')).toBeInTheDocument();
      expect(screen.queryByText('PENDING')).not.toBeInTheDocument();
    });

    it('carries no photos — those belong to the drawer', () => {
      renderDashboard();

      expect(within(rowFor('EMP1042')).queryByRole('img')).not.toBeInTheDocument();
      expect(within(rowFor('EMP1042')).queryByAltText('Priya Sharma')).not.toBeInTheDocument();
    });

    it('keeps the reason out of the row — it is not on the list response at all', () => {
      renderDashboard();

      expect(screen.queryByText('Relocating to another city.')).not.toBeInTheDocument();
    });
  });

  describe('details drawer', () => {
    it('stays closed until a row action is used', () => {
      renderDashboard();

      expect(screen.getByTestId('DrawerTest')).not.toHaveAttribute('open');
      expect(SeparationsClient.getSeparation).not.toHaveBeenCalled();
    });

    it('names the row in each action, so the buttons are told apart', () => {
      renderDashboard();

      expect(
        within(rowFor('EMP1042')).getByRole('button', { name: /View separation details.*Priya Sharma/ })
      ).toBeInTheDocument();
    });

    it("reads the separation by its own id, not the employee's", async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(openRow('EMP1042'));

      expect(SeparationsClient.getSeparation).toHaveBeenCalledWith('sep-1');
    });

    it('opens showing what the row already carries, before the read resolves', async () => {
      const user = userEvent.setup();

      /* A read that never settles, so the drawer is observed mid-flight. */
      vi.mocked(SeparationsClient.getSeparation).mockReturnValue(new Promise(() => {}));

      renderDashboard();

      await user.click(openRow('EMP1042'));

      expect(screen.getByTestId('DrawerTest')).toHaveAttribute('open');
      expect(drawer().getByText('Priya Sharma')).toBeInTheDocument();
      expect(drawer().getByText('Resignation')).toBeInTheDocument();
      expect(drawer().getByText('30 days')).toBeInTheDocument();
    });

    it('fills in the reason and notes once the read lands', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(openRow('EMP1042'));

      await waitFor(() => expect(drawer().getByText('Relocating to another city.')).toBeInTheDocument());
      expect(drawer().getByText('Knowledge transfer to be completed by 10 Oct.')).toBeInTheDocument();
      expect(drawer().getByText('Anita Rao')).toBeInTheDocument();
    });

    it('warms the read on hover, so the click lands on a drawer that is already full', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.hover(openRow('EMP1042'));

      expect(SeparationsClient.getSeparation).toHaveBeenCalledWith('sep-1');
    });

    it("shows the backend's message and a retry when the read fails", async () => {
      const user = userEvent.setup();
      vi.mocked(SeparationsClient.getSeparation).mockRejectedValue(new Error('Separation not found.'));

      renderDashboard();

      await user.click(openRow('EMP1042'));

      await waitFor(() => expect(drawer().getByText('Separation not found.')).toBeInTheDocument());

      /* What the row supplied is still on screen. */
      expect(drawer().getByText('Priya Sharma')).toBeInTheDocument();
    });

    it('re-reads on retry', async () => {
      const user = userEvent.setup();

      /*
      Not `...Once`: clicking a row moves the pointer onto it first, so the hover warm-up
      fires its own read, and a one-shot rejection would be spent before the click's.
      */
      vi.mocked(SeparationsClient.getSeparation).mockRejectedValue(new Error('Network error.'));

      renderDashboard();

      await user.click(openRow('EMP1042'));
      await waitFor(() => expect(drawer().getByText('Network error.')).toBeInTheDocument());

      vi.mocked(SeparationsClient.getSeparation).mockResolvedValue(detail);

      await user.click(drawer().getByRole('button', { name: /Try again/i }));

      await waitFor(() => expect(drawer().getByText('Relocating to another city.')).toBeInTheDocument());
    });

    it('closes from the drawer header', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(openRow('EMP1042'));
      await user.click(screen.getByRole('button', { name: 'Close drawer' }));

      expect(screen.getByTestId('DrawerTest')).not.toHaveAttribute('open');
    });

    it('swaps in the next row when a different one is opened', async () => {
      const user = userEvent.setup();
      renderDashboard();

      await user.click(openRow('EMP1042'));
      await waitFor(() => expect(drawer().getByText('Priya Sharma')).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: 'Close drawer' }));
      await user.click(openRow('EMP1007'));

      await waitFor(() => expect(drawer().getByText('Rahul Menon')).toBeInTheDocument());
      expect(drawer().queryByText('Priya Sharma')).not.toBeInTheDocument();
    });

    it('ignores a slow read for a row the user has since moved off', async () => {
      const user = userEvent.setup();

      let resolveFirst: (value: SeparationDetail) => void = () => {};

      /* The first row's read hangs; every other id answers normally. */
      vi.mocked(SeparationsClient.getSeparation).mockImplementation((id: string) => {
        if (id === 'sep-1') {
          return new Promise<SeparationDetail>((resolve) => {
            resolveFirst = resolve;
          });
        }

        return Promise.resolve(DETAILS_BY_ID[id]);
      });

      renderDashboard();

      await user.click(openRow('EMP1042'));
      await user.click(screen.getByRole('button', { name: 'Close drawer' }));
      await user.click(openRow('EMP1007'));

      await waitFor(() => expect(drawer().getByText('Contract ended and was not renewed.')).toBeInTheDocument());

      /* The first read lands late, carrying the row the user has already left. */
      resolveFirst(detail);

      await waitFor(() => expect(drawer().getByText('Rahul Menon')).toBeInTheDocument());
      expect(drawer().queryByText('Relocating to another city.')).not.toBeInTheDocument();
      expect(drawer().getByText('Contract ended and was not renewed.')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('says nothing has been filed rather than the generic "No data found"', () => {
      renderDashboard([], { ...meta, totalItems: 0, totalPages: 0, hasNextPage: false });

      expect(screen.getByText('No separation requests have been filed yet')).toBeInTheDocument();
      expect(screen.queryByText('No data found')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('pages against the server total rather than the rows it was handed', () => {
      renderDashboard();

      expect(screen.getByText('Showing 1 to 10 out of 37 records')).toBeInTheDocument();
    });

    it('does not re-fetch the page the server already rendered', () => {
      renderDashboard();

      expect(getSeparations).not.toHaveBeenCalled();
    });

    it('fetches the next page when the user pages', async () => {
      const user = userEvent.setup();
      vi.mocked(getSeparations).mockResolvedValue({
        success: true,
        separations: [makeSeparation({ id: 'sep-9', employee: { ...separations[0].employee, employeeId: 'EMP2000' } })],
        meta: { ...meta, currentPage: 2, hasPreviousPage: true },
        statusCounts: { PENDING: 3, APPROVED: 28 },
      });

      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      await waitFor(() => expect(getSeparations).toHaveBeenCalledWith({ page: 2, limit: 10 }));
      await waitFor(() => expect(screen.getByRole('cell', { name: 'EMP2000' })).toBeInTheDocument());
    });

    it('reports a failed page fetch without clearing the rows on screen', async () => {
      const user = userEvent.setup();
      vi.mocked(getSeparations).mockResolvedValue({ success: false, message: 'Server unavailable.' });

      renderDashboard();

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      await waitFor(() =>
        expect(showNotificationMock).toHaveBeenCalledWith(
          STRINGS.SEPARATIONS_FETCH_FAILED,
          'Server unavailable.',
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        )
      );

      expect(screen.getByRole('cell', { name: 'EMP1042' })).toBeInTheDocument();
    });
  });
});
