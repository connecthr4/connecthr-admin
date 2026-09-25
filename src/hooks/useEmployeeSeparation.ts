'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getEmployeeSeparation } from '@/src/lib/actions/separation';
import { logger } from '@/src/lib/logger';
import { STRINGS } from '@/src/constants/strings';

import type { SeparationDetail } from '@/src/lib/types/separation';

/** What the hook reports about the separation it was asked for. */
export interface EmployeeSeparationState {
  /**
   * The employee's current separation, or null when none has been filed.
   *
   * Null is an answer, not an absence — {@link isLoading} is what tells the two apart, so a
   * section reading this must check that first or it will announce "none filed" while the
   * read is still in flight.
   */
  separation: SeparationDetail | null;

  /** True from the render that asks for a separation until its response lands. */
  isLoading: boolean;

  /** The backend's own wording, or an empty string while nothing has failed. */
  errorMessage: string;

  /** Reads it again — what a failed load offers the user. */
  reload: () => void;
}

/** A read that has finished, and the request it answers. */
interface LoadedSeparation {
  requestKey: string;
  separation: SeparationDetail | null;
  errorMessage: string;
}

const NOTHING_LOADED: LoadedSeparation = { requestKey: '', separation: null, errorMessage: '' };

/**
 * One employee's current separation, read the first time it is actually asked for.
 *
 * The same shape as {@link useEmployeeAttendance}, and for the same reason: nothing is
 * requested until `enabled` turns true, and the answer is kept for as long as the hook
 * lives — so opening the Separation section costs one request, switching away and back
 * costs none, and a profile nobody opens that section on costs nothing at all. Only a
 * different employee, or {@link EmployeeSeparationState.reload}, sends another.
 *
 * An employee with no separation is a success carrying null, not a failure: the action
 * folds the endpoint's 404 into that before it reaches here.
 *
 * @param employeeId - The employee's "EMP1042" code, which is what this endpoint is keyed
 *   on — not the record id the details route uses.
 * @param enabled - Whether the section is on screen. False keeps the hook idle.
 */
export function useEmployeeSeparation(employeeId: string, enabled: boolean): EmployeeSeparationState {
  /* Bumped by `reload`, so a retry is a request the key below can tell apart. */
  const [attempt, setAttempt] = useState(0);

  const [loaded, setLoaded] = useState<LoadedSeparation>(NOTHING_LOADED);

  /**
   * The request in flight, or the last one made. Server Functions have no
   * `AbortController`, so a response the user has already moved past is discarded by
   * comparing keys rather than cancelled — and the same ref is what keeps one key from
   * being requested twice.
   */
  const requestedKeyRef = useRef('');

  const requestKey = `${employeeId}|${attempt}`;

  /*
  Derived rather than flagged on and off in the effect: the panel shows its placeholders
  from the render that opens the section, instead of a render later when an effect gets
  around to saying a read has started.
  */
  const isLoading = enabled && loaded.requestKey !== requestKey;

  useEffect(() => {
    /* Not on screen yet — a section nobody has opened is not worth a request. */
    if (!enabled || requestedKeyRef.current === requestKey) {
      return;
    }

    requestedKeyRef.current = requestKey;

    getEmployeeSeparation(employeeId)
      .then((result) => {
        // The employee changed, or a retry overtook this — ignore the stale answer.
        if (requestedKeyRef.current !== requestKey) {
          return;
        }

        setLoaded(
          result.success
            ? { requestKey, separation: result.data, errorMessage: '' }
            : { requestKey, separation: null, errorMessage: result.message }
        );
      })
      .catch((error) => {
        if (requestedKeyRef.current !== requestKey) {
          return;
        }

        logger.error("Unexpected error fetching the employee's separation:", error);
        setLoaded({ requestKey, separation: null, errorMessage: STRINGS.EMPLOYEE_SEPARATION_FETCH_FAILED });
      });
  }, [employeeId, enabled, requestKey]);

  const reload = useCallback(() => setAttempt((previous) => previous + 1), []);

  /*
  A separation from a previous employee, or from before a retry, is not this request's — it
  is withheld rather than shown under the wrong name while the current read is in flight.
  */
  if (loaded.requestKey !== requestKey) {
    return { separation: null, isLoading, errorMessage: '', reload };
  }

  return { separation: loaded.separation, isLoading, errorMessage: loaded.errorMessage, reload };
}
