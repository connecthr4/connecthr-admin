'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getEmployeeAttendance } from '@/src/lib/actions/attendance';
import { logger } from '@/src/lib/logger';
import { STRINGS } from '@/src/constants/strings';

import type { EmployeeAttendanceRow } from '@/src/lib/types/attendance';

/** No history — what the hook holds before a read lands, and after one fails. */
const NO_ROWS: EmployeeAttendanceRow[] = [];

/** What the hook reports about the history it was asked for. */
export interface EmployeeAttendanceState {
  /** Every day on record, in the order the backend listed them. */
  rows: EmployeeAttendanceRow[];

  /** True from the render that asks for a history until its response lands. */
  isLoading: boolean;

  /** The backend's own wording, or an empty string while nothing has failed. */
  errorMessage: string;

  /** Reads the history again — what a failed load offers the user. */
  reload: () => void;
}

/** A read that has finished, and the request it answers. */
interface LoadedHistory {
  requestKey: string;
  rows: EmployeeAttendanceRow[];
  errorMessage: string;
}

const NOTHING_LOADED: LoadedHistory = { requestKey: '', rows: NO_ROWS, errorMessage: '' };

/**
 * One employee's attendance history, read the first time it is actually asked
 * for.
 *
 * Lazy and read once: nothing is requested until `enabled` turns true, and the
 * answer is kept for as long as the hook lives — so opening the Attendance
 * section costs one request, and switching back and forth between it and the
 * profile costs none. Only a different employee, or {@link
 * EmployeeAttendanceState.reload}, sends another.
 *
 * @param employeeId - The employee's record id, as the details route is keyed on.
 * @param enabled - Whether the history is on screen. False keeps the hook idle.
 */
export function useEmployeeAttendance(employeeId: string, enabled: boolean): EmployeeAttendanceState {
  /* Bumped by `reload`, so a retry is a request the key below can tell apart. */
  const [attempt, setAttempt] = useState(0);

  const [loaded, setLoaded] = useState<LoadedHistory>(NOTHING_LOADED);

  /**
   * The request in flight, or the last one made. Server Functions have no
   * `AbortController`, so a response the user has already moved past is
   * discarded by comparing keys rather than cancelled — and the same ref is
   * what keeps one key from being requested twice.
   */
  const requestedKeyRef = useRef('');

  const requestKey = `${employeeId}|${attempt}`;

  /*
  Derived rather than flagged on and off in the effect: the table shows its
  skeleton from the render that opens the section, instead of a render later
  when an effect gets around to saying a read has started.
  */
  const isLoading = enabled && loaded.requestKey !== requestKey;

  useEffect(() => {
    /* Not on screen yet — a section nobody has opened is not worth a request. */
    if (!enabled || requestedKeyRef.current === requestKey) {
      return;
    }

    requestedKeyRef.current = requestKey;

    getEmployeeAttendance(employeeId)
      .then((result) => {
        // The employee changed, or a retry overtook this — ignore the stale answer.
        if (requestedKeyRef.current !== requestKey) {
          return;
        }

        setLoaded(
          result.success
            ? { requestKey, rows: result.data.rows, errorMessage: '' }
            : { requestKey, rows: NO_ROWS, errorMessage: result.message }
        );
      })
      .catch((error) => {
        if (requestedKeyRef.current !== requestKey) {
          return;
        }

        logger.error("Unexpected error fetching the employee's attendance:", error);
        setLoaded({ requestKey, rows: NO_ROWS, errorMessage: STRINGS.EMPLOYEE_ATTENDANCE_FETCH_FAILED });
      });
  }, [employeeId, enabled, requestKey]);

  const reload = useCallback(() => setAttempt((previous) => previous + 1), []);

  /*
  A history from a previous employee, or from before a retry, is not this
  request's — it is withheld rather than shown under the wrong heading while the
  current read is in flight.
  */
  if (loaded.requestKey !== requestKey) {
    return { rows: NO_ROWS, isLoading, errorMessage: '', reload };
  }

  return { rows: loaded.rows, isLoading, errorMessage: loaded.errorMessage, reload };
}
