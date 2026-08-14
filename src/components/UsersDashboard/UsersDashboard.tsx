/**
 * Read-only list of the admin accounts the signed-in user is entitled to see.
 *
 * Ships without row actions on purpose: the API has no edit, delete, disable
 * or reset-password endpoint yet, so any control here would be a button with
 * nothing behind it.
 *
 * @example
 * ```tsx
 * import UsersDashboard from '@src/components/UsersDashboard'
 *
 * export default function Example() {
 *   return <UsersDashboard initialUsers={users} currentUser={user} />;
 * }
 * ```
 */
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ColumnDef } from '@tanstack/react-table';
import { CirclePlus } from 'lucide-react';
import AppHeader from '../AppHeader';
import Button from '../Button';
import DataTable from '../DataTable';
import { formatRole } from '@/src/lib/auth/roles';
import { formatTimestampDate } from '@/src/utils/date';
import { ROUTES, STRINGS } from '@/src/constants/strings';
import styles from './UsersDashboard.module.scss';

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
   */
  initialUsers: ManagedUser[];

  /**
   * The signed-in user, for the header chip. Passed from the server render so
   * a page reload doesn't blank it out.
   */
  currentUser: User | null;
}

export default function UsersDashboard({ initialUsers, currentUser }: UsersDashboardProps) {
  const router = useRouter();

  const columns = useMemo(() => USER_COLUMNS, []);

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
    </div>
  );
}
