/**
 * List of the admin accounts the signed-in user is entitled to see, with a
 * delete action on the rows they are entitled to act on.
 *
 * Delete is the only row action: the API has no edit, disable or
 * reset-password endpoint yet, so anything else here would be a button with
 * nothing behind it.
 *
 * @example
 * ```tsx
 * import UsersDashboard from '@src/components/UsersDashboard'
 *
 * export default function Example() {
 *   return <UsersDashboard initialUsers={users} assignableRoles={roles} currentUser={user} />;
 * }
 * ```
 */
'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ColumnDef } from '@tanstack/react-table';
import { CirclePlus, Trash2 } from 'lucide-react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import DataTable from '../DataTable';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { Text2 } from '../Typography';
import { deleteUser } from '@/src/lib/actions/users';
import { formatRole, ROLES } from '@/src/lib/auth/roles';
import { formatTimestampDate } from '@/src/utils/date';
import { useNotification } from '@/src/providers/NotificationProvider';
import { NOTIFICATION_TYPES, ROUTES, STRINGS } from '@/src/constants/strings';
import styles from './UsersDashboard.module.scss';

import type { Role } from '@/src/lib/auth/roles';
import type { User } from '@/src/lib/types/auth';
import type { ManagedUser, UserStatus } from '@/src/lib/types/users';

/**
 * `DataTable` is generic and wrapped in `memo()`, which TypeScript can't
 * instantiate per call site — cast once here so this file stays typed for
 * `ManagedUser`.
 */
const UsersTable = DataTable as unknown as (props: {
  data: ManagedUser[];
  columns: ColumnDef<ManagedUser>[];
}) => React.JSX.Element;

const STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: styles.statusActive,
  LOCKED: styles.statusLocked,
  DISABLED: styles.statusDisabled,
};

const USER_COLUMNS: ColumnDef<ManagedUser>[] = [
  {
    accessorKey: 'name',
    header: STRINGS.USER_NAME,
  },

  {
    accessorKey: 'email',
    header: STRINGS.USER_EMAIL,
  },

  {
    accessorKey: 'role',
    header: STRINGS.USER_ROLE,
    cell: ({ row }) => formatRole(row.original.role),
  },

  {
    accessorKey: 'status',
    header: STRINGS.USER_STATUS,
    cell: ({ row }) => (
      <span className={clsx(styles.statusBadge, STATUS_CLASS[row.original.status])}>{row.original.status}</span>
    ),
  },

  {
    accessorKey: 'lastLoginAt',
    header: STRINGS.USER_LAST_LOGIN,
    /* An account that has never signed in reads better as "Never" than as a dash. */
    cell: ({ row }) => formatTimestampDate(row.original.lastLoginAt) || STRINGS.NEVER,
  },

  {
    accessorKey: 'createdBy',
    header: STRINGS.USER_CREATED_BY,
    /*
    Null for CLI-created accounts and for the rows that predate the column.
    Rendered as a dash — "Unknown" would imply the information was lost.
    */
    cell: ({ row }) => row.original.createdBy?.name ?? STRINGS.NOT_AVAILABLE,
  },
];

/**
 * Define the props available for the UsersDashboard component.
 */
interface UsersDashboardProps {
  /**
   * Every account, newest first, resolved on the server by the users route.
   * The endpoint has no pagination, search or filtering — the table paginates
   * what it is given locally, which is fine at current volume.
   *
   * Rendered straight from this prop rather than copied into state: a delete
   * refreshes the route, so the new list arrives as a new prop and the table
   * has no second copy of the rows to keep in step.
   */
  initialUsers: ManagedUser[];

  /**
   * Roles this account may act on, from `/users/assignable-roles` — the same
   * list that drives the create-user dropdown, and here what decides which
   * rows offer a delete. Fetched rather than derived so the backend stays the
   * source of truth on who may act on whom, and empty if that lookup failed,
   * which hides the action everywhere rather than offering one that will 403.
   */
  assignableRoles: Role[];

  /**
   * The signed-in user, for the header chip — and for keeping the delete
   * action off their own row.
   */
  currentUser: User | null;
}

export default function UsersDashboard({ initialUsers, assignableRoles, currentUser }: UsersDashboardProps) {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [userPendingDeletion, setUserPendingDeletion] = useState<ManagedUser | null>(null);

  /*
  The transition covers more than the DELETE: the Server Function refreshes
  the route, so it stays pending until the re-rendered list has been applied.
  The modal's spinner therefore runs until the row is actually gone from the
  table, rather than until the request came back.
  */
  const [isDeleting, startDeleting] = useTransition();

  const deletableRoles = useMemo(() => new Set(assignableRoles), [assignableRoles]);

  const columns = useMemo<ColumnDef<ManagedUser>[]>(() => {
    /**
     * Whether this account may be deleted by the signed-in one.
     *
     * Rank is not compared here. `assignable-roles` already encodes it — IT is
     * handed `["SUPER_ADMIN", "ADMIN"]` and a Super Admin only `["ADMIN"]`, so
     * a Super Admin is never offered a peer's row, and IT never appears in
     * anybody's list. The explicit `IT` check is belt and braces for the same
     * reason the create-user form filters it: nothing outranks IT, so an IT
     * row could only ever produce a 403.
     */
    const canDelete = (user: ManagedUser) =>
      user.id !== currentUser?.id && user.role !== ROLES.IT && deletableRoles.has(user.role);

    /*
    An account that can delete nobody gets no column at all, rather than a
    column of blanks.
    */
    if (deletableRoles.size === 0) {
      return USER_COLUMNS;
    }

    return [
      ...USER_COLUMNS,
      {
        id: 'actions',
        header: STRINGS.USER_ACTIONS,
        /*
        Rows the caller cannot act on render an empty cell. Hidden rather than
        disabled: a greyed-out bin on the IT rows would read as "not yet",
        when the answer is that no account can ever delete those.
        */
        cell: ({ row }) =>
          canDelete(row.original) ? (
            <button
              type="button"
              className={styles.deleteAction}
              aria-label={`${STRINGS.DELETE} ${row.original.name}`}
              disabled={isDeleting}
              onClick={() => setUserPendingDeletion(row.original)}
            >
              <Trash2 size={18} aria-hidden />
            </button>
          ) : null,
      },
    ];
  }, [deletableRoles, currentUser?.id, isDeleting]);

  const handleConfirmDelete = () => {
    if (!userPendingDeletion) {
      return;
    }

    const { id, name } = userPendingDeletion;

    startDeleting(async () => {
      const result = await deleteUser(id);

      if (!result.success) {
        /*
        The modal stays open on a failure — the row is still there, and so is
        the decision the user came to make.
        */
        showNotification(
          STRINGS.USER_DELETION_FAILED,
          result.message,
          NOTIFICATION_TYPES.ERROR,
          5000,
          'top-right',
          false
        );

        return;
      }

      setUserPendingDeletion(null);
      showNotification(STRINGS.USER_DELETED_SUCCESSFULLY, name, NOTIFICATION_TYPES.SUCCESS, 5000, 'top-right', false);
    });
  };

  return (
    <div className={styles.container}>
      <AppHeader title={STRINGS.USERS} subtitle={STRINGS.ALL_USER_ACCOUNTS} userDetails={currentUser} />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <Button
            startIcon={CirclePlus}
            iconSize={24}
            className={styles.button}
            onClick={() => router.push(ROUTES.CREATE_USER)}
          >
            {STRINGS.CREATE_USER}
          </Button>
        </div>

        <div className={styles.tableContainer}>
          <UsersTable data={initialUsers} columns={columns} />
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={Boolean(userPendingDeletion)}
        onClose={() => setUserPendingDeletion(null)}
        onConfirm={handleConfirmDelete}
        title={STRINGS.DELETE_USER}
        description={STRINGS.DELETE_USER_CONFIRMATION}
        confirmLabel={STRINGS.DELETE}
        isDeleting={isDeleting}
      >
        {/* Confirmed against the row, not against a memory of which bin was clicked. */}
        {userPendingDeletion && (
          <div className={styles.deleteTarget}>
            <Text2 className={styles.deleteTargetName}>{userPendingDeletion.name}</Text2>

            <Text2 className={styles.deleteTargetMeta}>
              {userPendingDeletion.email} · {formatRole(userPendingDeletion.role)}
            </Text2>
          </div>
        )}
      </DeleteConfirmationModal>
    </div>
  );
}
