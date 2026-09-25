/**
 * The separations list: every separation that has been filed, and what each one said.
 *
 * Separations are filed from the employee list's exit action; this screen is where they are
 * read and decided. The row action opens the submission, and the drawer it opens is the only
 * place a decision can be taken — an approver reads what was actually filed before approving
 * it, which a pair of buttons in the table row would let them skip.
 *
 * Only the rows the backend says are decidable offer the buttons: `permissions.canDecide`,
 * and a status still `PENDING`. Withdrawal is still not wired up.
 *
 * @example
 * ```tsx
 * import SeparationsDashboard from '@src/components/SeparationsDashboard'
 *
 * export default function Example() {
 *   return <SeparationsDashboard initialSeparations={rows} initialMeta={meta} currentUser={user} />;
 * }
 * ```
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Check, Eye, X } from 'lucide-react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import DataTable from '../DataTable';
import Drawer from '../Drawer';
import SeparationDecisionModal from '../SeparationDecisionModal';
import SeparationDetails from '../SeparationDetails';
import SeparationStatusBadge from '../SeparationStatusBadge';
import { decideSeparation, getSeparations } from '@/src/lib/actions/separation';
import { SeparationsClient } from '@/src/lib/api/separationClient';
import { logger } from '@/src/lib/logger';
import { useNotification } from '@/src/providers/NotificationProvider';
import { formatLongDate } from '@/src/utils/date';
import { NOTIFICATION_TYPES, STRINGS } from '@/src/constants/strings';
import styles from './SeparationsDashboard.module.scss';

import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { PendingSeparationDecision } from '../SeparationDecisionModal';
import type { User } from '@/src/lib/types/auth';
import type {
  DecideSeparationResult,
  SeparationDecisionOutcome,
  SeparationDetail,
  SeparationListItem,
  SeparationListMeta,
} from '@/src/lib/types/separation';

/**
 * Wording for a row this screen has just decided, covering the gap between the decision
 * landing and the next read of the list. Only reached when the decide response does not carry
 * the decided record — the contract does not promise it, so nothing here depends on it.
 */
const DECIDED_STATUS_LABEL: Record<SeparationDecisionOutcome, string> = {
  APPROVED: STRINGS.APPROVED,
  REJECTED: STRINGS.REJECTED,
};

/**
 * A decided copy of a row.
 *
 * Takes the backend's own wording and timestamp where the response carried the decided
 * record, and stands them in where it did not — the `decidedAt` a list row holds flat lives
 * under `decision` on the detail shape, which is the one field that has to be reached for.
 *
 * `canDecide` is cleared whatever the backend said before: the decision is made, so the
 * buttons must not come back if the drawer is reopened on this row before the list is read
 * again.
 */
function withDecision(
  separation: SeparationListItem,
  outcome: SeparationDecisionOutcome,
  decided?: SeparationDetail
): SeparationListItem {
  return {
    ...separation,
    status: decided?.status ?? outcome,
    statusLabel: decided?.statusLabel ?? DECIDED_STATUS_LABEL[outcome],
    decidedAt: decided?.decision?.decidedAt ?? new Date().toISOString(),
    permissions: { ...separation.permissions, canDecide: false, canWithdraw: false },
  };
}

/**
 * `DataTable` is generic and wrapped in `memo()`, which TypeScript can't instantiate per
 * call site — cast once here so this file stays typed for `SeparationListItem`.
 */
const SeparationsTable = DataTable as unknown as (props: {
  data: SeparationListItem[];
  columns: ColumnDef<SeparationListItem>[];
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  totalItems?: number;
  isLoading?: boolean;
  emptyMessage?: string;
}) => React.JSX.Element;

/**
 * Every column but the action one, built once at module scope: none of them close over
 * anything from the component, so rebuilding them per render would only cost the memoized
 * table its identity check.
 */
const STATIC_COLUMNS: ColumnDef<SeparationListItem>[] = [
  {
    id: 'employeeId',
    accessorFn: (row) => row.employee.employeeId,
    header: STRINGS.EMPLOYEE_ID,
  },
  {
    id: 'employeeName',
    accessorFn: (row) => row.employee.name,
    header: STRINGS.EMPLOYEE_NAME,

    /*
    Name only. The photo lives in the drawer, where it sits beside enough of the record to be
    worth the space — in a row it was decoration next to the employee id, which is what
    actually identifies someone here.
    */
  },
  {
    accessorKey: 'separationTypeLabel',
    header: STRINGS.RESIGNATION_TYPE,
  },
  {
    accessorKey: 'resignationDate',
    header: STRINGS.RESIGNATION_DATE,
    cell: ({ row }) => formatLongDate(row.original.resignationDate),
  },
  {
    accessorKey: 'lastWorkingDate',
    header: STRINGS.LAST_WORKING_DATE,
    cell: ({ row }) => formatLongDate(row.original.lastWorkingDate),
  },
  {
    accessorKey: 'status',
    header: STRINGS.CURRENT_STATUS,

    /* The wording is the backend's `statusLabel`; only the colour is decided in the badge. */
    cell: ({ row }) => <SeparationStatusBadge status={row.original.status} label={row.original.statusLabel} />,
  },
];

/**
 * Adds the action column, which is the only one that needs anything from the component.
 * Split out this way so the seven static columns above are not rebuilt alongside it.
 */
function buildSeparationColumns(onView: (separation: SeparationListItem) => void): ColumnDef<SeparationListItem>[] {
  return [
    ...STATIC_COLUMNS,
    {
      id: 'actions',
      header: STRINGS.ACTION,
      enableSorting: false,

      /*
      A real button, not an icon with an `onClick`: this one is reachable by keyboard and
      announces itself, and the row it belongs to is named in the label so a screen reader
      does not read out ten identical "View separation details" buttons.
      */
      cell: ({ row }) => (
        <button
          type="button"
          className={styles.actionButton}
          aria-label={`${STRINGS.VIEW_SEPARATION_DETAILS} — ${row.original.employee.name}`}
          onClick={() => onView(row.original)}
          /*
          Warms the detail read on hover, so the click usually lands on a drawer that is
          already full. The client de-duplicates, so the click's own read joins this one
          rather than making a second.
          */
          onMouseEnter={() => {
            void SeparationsClient.getSeparation(row.original.id).catch(() => {
              /* A failed warm-up is not an error yet — the open will surface it. */
            });
          }}
        >
          <Eye size={20} />
        </button>
      ),
    },
  ];
}

/**
 * Define the props available for the SeparationsDashboard component.
 */
interface SeparationsDashboardProps {
  /**
   * The first page of separations, resolved by the route on the server. Later pages are
   * fetched from here as the user pages.
   */
  initialSeparations: SeparationListItem[];

  /**
   * The first page's paging meta, which is also where the total row count comes from.
   */
  initialMeta: SeparationListMeta;

  /**
   * The signed-in user, for the header chip. Passed from the server render so a page reload
   * doesn't blank it out.
   */
  currentUser: User | null;

  /**
   * Records an approver's decision on one separation.
   *
   * Defaults to the `decideSeparation` Server Function, which is what it is in the app. It is
   * a prop at all so the confirmation flow can be driven from a story or a test without a
   * backend behind it.
   *
   * @param separationId - The separation being decided.
   * @param outcome - Which way, which is also the status the row ends up in.
   * @param remarks - The grounds. Optional on an approval, required on a rejection.
   * @returns Whether it was recorded, and what to tell the user.
   */
  onDecide?: (
    separationId: string,
    outcome: SeparationDecisionOutcome,
    remarks?: string
  ) => Promise<DecideSeparationResult>;
}

export default function SeparationsDashboard({
  initialSeparations,
  initialMeta,
  currentUser,
  onDecide = decideSeparation,
}: SeparationsDashboardProps) {
  const { showNotification } = useNotification();

  const [separations, setSeparations] = useState(initialSeparations);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialMeta.currentPage - 1,
    pageSize: initialMeta.pageSize,
  });

  /**
   * The row whose separation is being read. Kept apart from the drawer's open state so the
   * panel still has a row to render while it animates shut.
   */
  const [selectedSeparation, setSelectedSeparation] = useState<SeparationListItem | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  /**
   * The detail read, kept as one object rather than three separate pieces of state.
   *
   * `key` is which read it belongs to — the separation id and the attempt number — which is
   * what lets a response be matched against the read that is actually current, and what the
   * reset below keys off.
   */
  const [detailState, setDetailState] = useState<{
    key: string | null;
    detail: SeparationDetail | null;
    isLoading: boolean;
    error: string | null;
  }>({ key: null, detail: null, isLoading: false, error: null });

  /**
   * Bumped to re-run the detail read for the row already selected — which is all "try again"
   * has to do, since selecting the same row again would otherwise not change anything the
   * effect below depends on.
   */
  const [detailAttempt, setDetailAttempt] = useState(0);

  /**
   * The decision the confirmation modal is asking about — which row, and which way — or null
   * when it is closed.
   *
   * One piece of state rather than an open flag beside an outcome, so there is no way to be
   * open without knowing what is being confirmed.
   */
  const [pendingDecision, setPendingDecision] = useState<PendingSeparationDecision | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  /**
   * Hands the screen over from the drawer to the confirmation modal.
   *
   * The drawer closes as the modal opens, and they are not stacked: `Drawer` is a native
   * `<dialog>` opened with `showModal()`, which puts it in the browser's top layer — above
   * anything `Modal` can reach by portalling into `document.body`, whatever its z-index. A
   * confirmation rendered over the open drawer would sit behind its backdrop and take no
   * clicks.
   *
   * Nothing is lost in the handover: the modal restates the employee and the last working
   * date, and cancelling puts the drawer back exactly as it was — `selectedSeparation` never
   * changed, and the detail read is still cached.
   */
  const handleOpenDecision = (outcome: SeparationDecisionOutcome) => {
    if (!selectedSeparation) {
      return;
    }

    setPendingDecision({ separation: selectedSeparation, outcome });
    setIsDetailsDrawerOpen(false);
  };

  /** Cancelled, so the submission the approver was reading comes back. */
  const handleCancelDecision = () => {
    setPendingDecision(null);
    setIsDetailsDrawerOpen(true);
  };

  /**
   * The drawer opens on the row the user clicked, already showing everything that row
   * carries; the effect below fills in the reason, the notes and the decision.
   *
   * Pure setters, so the callback is stable and the columns are built once rather than on
   * every render.
   */
  const handleViewSeparation = useCallback((separation: SeparationListItem) => {
    setSelectedSeparation(separation);
    setIsDetailsDrawerOpen(true);
  }, []);

  /**
   * The row is deliberately left in state: the drawer keeps its content mounted while it
   * slides shut, and clearing it here would empty the panel mid-animation. The next open
   * replaces it.
   */
  const handleCloseDetailsDrawer = useCallback(() => setIsDetailsDrawerOpen(false), []);

  /**
   * Retry after a failed read. The client evicts a failure, so this really does re-request
   * rather than handing back the rejection it cached.
   */
  const handleRetryDetail = useCallback(() => setDetailAttempt((attempt) => attempt + 1), []);

  const columns = useMemo(() => buildSeparationColumns(handleViewSeparation), [handleViewSeparation]);

  /**
   * Records the decision the modal is confirming.
   *
   * The modal is left open on a failure: the row has not moved, and neither has the decision
   * the approver came to make — closing it would hand back a screen that looks like nothing
   * was attempted.
   */
  const handleConfirmDecision = async (remarks: string) => {
    if (!pendingDecision || isDeciding) {
      return;
    }

    const { separation, outcome } = pendingDecision;

    setIsDeciding(true);

    try {
      /*
      Empty remarks are left off entirely rather than sent as `""`. The approval endpoint
      treats the field as optional, and an empty string is not the same thing as not saying
      anything — the modal only ever hands back an empty one from the approval panel, which
      asks for nothing.
      */
      const result = await onDecide(separation.id, outcome, remarks || undefined);

      if (!result.success) {
        showNotification(
          STRINGS.SEPARATION_DECISION_FAILED,
          result.message,
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        );

        return;
      }

      /*
      Patched in place rather than re-read: the list is paged, and re-fetching the page to
      move one badge would blank the table the approver is working down. The next page turn
      reads the list afresh anyway.
      */
      const decided = withDecision(separation, outcome, result.data);

      setSeparations((rows) => rows.map((row) => (row.id === separation.id ? decided : row)));
      setSelectedSeparation((current) => (current?.id === separation.id ? decided : current));

      /*
      The cached detail still says PENDING. Dropping it is not enough on its own — the read is
      keyed on the row and the attempt, so reopening this row would otherwise re-run nothing
      and show what is already in state. Bumping the attempt re-reads the record, which also
      leaves the cache warm with the decided one.
      */
      SeparationsClient.invalidate(separation.id);
      setDetailAttempt((attempt) => attempt + 1);

      /* The drawer was closed on the way in, so there is only the modal left to dismiss. */
      setPendingDecision(null);

      showNotification(
        outcome === 'APPROVED' ? STRINGS.SEPARATION_APPROVED : STRINGS.SEPARATION_REJECTED,
        result.message,
        NOTIFICATION_TYPES.SUCCESS,
        5000,
        'top-right',
        false
      );
    } catch (error) {
      logger.error('Error occurred while recording the separation decision:', error);

      const message = error instanceof Error ? error.message : '';

      showNotification(STRINGS.SEPARATION_DECISION_FAILED, message, NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
    } finally {
      setIsDeciding(false);
    }
  };

  /**
   * Whether the drawer should offer the decision buttons at all.
   *
   * Read off `permissions.canDecide` rather than worked out from the signed-in user's role.
   * The backend computes that flag with the same predicates its endpoints enforce, so it
   * already answers both rules at once — that deciding is restricted to the roles above
   * ADMIN, and that nobody may decide a separation they raised themselves. Re-deriving either
   * here would be a second opinion that could only ever disagree with the one that counts.
   *
   * The status is checked too, since `canDecide` speaks to who the caller is rather than to
   * whether there is anything left to decide.
   *
   * Preferring the detail read's copy of the flag matters for one case: a row the list
   * fetched as pending that somebody else has decided since. The detail read happens on open,
   * so the buttons disappear as it lands rather than sending the approver into a 403. It is
   * matched on id so that a response for the previous row can never answer for this one.
   */
  const selectedDetail = detailState.detail?.id === selectedSeparation?.id ? detailState.detail : null;
  const decidable = selectedDetail ?? selectedSeparation;

  const canDecideSelected = Boolean(decidable?.permissions.canDecide && decidable.status === 'PENDING');

  const selectedSeparationId = selectedSeparation?.id ?? null;

  /**
   * Identifies the read the drawer should currently be showing. The attempt number is part
   * of it so that "try again" counts as a new read of the same row.
   */
  const detailKey = selectedSeparationId ? `${selectedSeparationId}:${detailAttempt}` : null;

  /*
  Clear the previous row's detail as the new one is selected.

  Adjusted during render rather than in an effect, as React recommends for state derived from
  something else — the same thing `Drawer` does with its mounted flag. The re-render happens
  before the browser paints, so the panel never shows one row's reason under another row's
  name, which a reset in an effect would allow for a frame.
  */
  if (detailKey && detailState.key !== detailKey) {
    setDetailState({ key: detailKey, detail: null, isLoading: true, error: null });
  }

  /**
   * Reads the selected separation in full.
   *
   * Expressed as an effect on "which read is current" rather than as work done in the click
   * handler, so React's own cleanup is what discards a stale response: a slow read for a row
   * the user has since moved off is dropped because its effect was already cleaned up. The
   * key is checked again in the updater, so a response can only ever land on the read that
   * asked for it.
   *
   * The client caches per id, so reopening a row — or arriving on one already warmed by the
   * hover — resolves in a microtask and the placeholders never paint.
   */
  useEffect(() => {
    if (!selectedSeparationId || !detailKey) {
      return;
    }

    let isCurrent = true;

    SeparationsClient.getSeparation(selectedSeparationId)
      .then((data) => {
        if (isCurrent) {
          setDetailState((state) => (state.key === detailKey ? { ...state, detail: data, isLoading: false } : state));
        }
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        logger.error('Error occurred while fetching the separation details:', error);

        /*
        The backend's own wording where there is one — the client rethrows the message the
        Server Function reported — so the panel says what actually went wrong.
        */
        const message = error instanceof Error ? error.message : STRINGS.SEPARATION_DETAILS_FETCH_FAILED;

        setDetailState((state) => (state.key === detailKey ? { ...state, error: message, isLoading: false } : state));
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedSeparationId, detailKey]);

  /**
   * Fetches a page whenever the user moves off the one the server rendered.
   *
   * Guarded by a request id for the same reason the employee list is: paging quickly means
   * several reads in flight, and only the newest one may land.
   */
  const latestPageRequestRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    /* The first page is already on screen from the server render — don't re-fetch it. */
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      return;
    }

    const requestId = ++latestPageRequestRef.current;

    setIsLoading(true);

    getSeparations({ page: pagination.pageIndex + 1, limit: pagination.pageSize })
      .then((result) => {
        if (latestPageRequestRef.current !== requestId) {
          return;
        }

        if (result.success) {
          setSeparations(result.separations);
          setMeta(result.meta);
        } else {
          showNotification(
            STRINGS.SEPARATIONS_FETCH_FAILED,
            result.message,
            NOTIFICATION_TYPES.ERROR,
            5000,
            'top-right',
            false
          );
        }
      })
      .catch((error) => {
        if (latestPageRequestRef.current !== requestId) {
          return;
        }

        logger.error('Unexpected error fetching separations:', error);
        showNotification(STRINGS.SEPARATIONS_FETCH_FAILED, '', NOTIFICATION_TYPES.ERROR, 5000, 'top-right', false);
      })
      .finally(() => {
        if (latestPageRequestRef.current === requestId) {
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <div className={styles.container}>
      <AppHeader title={STRINGS.SEPARATIONS} subtitle={STRINGS.ALL_SEPARATION_REQUESTS} userDetails={currentUser} />

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <SeparationsTable
            data={separations}
            columns={columns}
            manualPagination
            pagination={pagination}
            onPaginationChange={setPagination}
            totalItems={meta.totalItems}
            isLoading={isLoading}
            emptyMessage={STRINGS.NO_SEPARATIONS_FOUND}
          />
        </div>
      </div>

      {/*
      Rendered unconditionally so the panel can animate both ways; the drawer unmounts its own
      content once closed, which is what gives the next row a clean panel.
      */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={handleCloseDetailsDrawer}
        title={STRINGS.SEPARATION_DETAILS}
        size="34rem"
        /*
        Pinned to the bottom of the drawer rather than placed after the fields: the panel
        scrolls, and a decision that can be scrolled out of sight is one an approver has to go
        looking for. A row with nothing to decide gets no footer at all — greyed-out buttons
        would read as "not yet" where the answer is "not ever".
        */
        footer={
          canDecideSelected && selectedSeparation ? (
            <div className={styles.decisionActions}>
              {/*
              Reject sits on the left, Approve on the right where a primary action is expected.
              Both are the same button recoloured, so the pair reads as the two states it leads
              to rather than as an action and its cancel.
              */}
              <Button
                startIcon={X}
                iconSize={18}
                className={clsx(styles.decisionButton, styles.rejectButton)}
                disabled={isDeciding}
                onClick={() => handleOpenDecision('REJECTED')}
              >
                {STRINGS.REJECT}
              </Button>

              <Button
                startIcon={Check}
                iconSize={18}
                className={clsx(styles.decisionButton, styles.approveButton)}
                disabled={isDeciding}
                onClick={() => handleOpenDecision('APPROVED')}
              >
                {STRINGS.APPROVE}
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedSeparation && (
          <SeparationDetails
            summary={selectedSeparation}
            detail={detailState.detail}
            isLoading={detailState.isLoading}
            error={detailState.error}
            onRetry={handleRetryDetail}
          />
        )}
      </Drawer>

      {/* Takes over from the drawer rather than stacking on it — see `handleOpenDecision`. */}
      <SeparationDecisionModal
        decision={pendingDecision}
        onClose={handleCancelDecision}
        onConfirm={handleConfirmDecision}
        isSubmitting={isDeciding}
      />
    </div>
  );
}
