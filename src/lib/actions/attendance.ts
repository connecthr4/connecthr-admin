'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { AttendanceApi } from '../api/attendance';
import { UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES } from '../../constants/strings';
import type {
  AttendanceWriteResult,
  GetAttendanceSheetRequest,
  GetAttendanceSheetResult,
  MarkAttendanceRequest,
} from '../types/attendance';

/**
 * Server Function — called directly from `MarkAttendanceDashboard` (a Client
 * Component) like a regular async function. Runs in a context where cookie
 * mutation is allowed (unlike a Server Component render), so a token refresh
 * triggered here persists normally.
 *
 * One call answers the whole screen: the page of rows, the day's head count and
 * the paging meta all arrive together, so nothing has to be stitched from a
 * second request.
 */
export async function getAttendanceSheet(request: GetAttendanceSheetRequest): Promise<GetAttendanceSheetResult> {
  /*
  Outside the try because `redirect` throws — this fork's guide again — and
  before the client is built because `getServerApiClient` refreshes on a 401,
  which would revive the session the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await AttendanceApi.getSheet(client, request);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching the attendance sheet:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — records a day's markings.
 *
 * The whole day travels in one request, which is what makes the submission
 * atomic: the backend either records the sheet or rejects it, so a half-written
 * day never has to be reconciled from here.
 *
 * The message is passed straight back on both paths — the backend's own wording
 * is what the user is shown, rather than a copy of it kept in the UI that could
 * drift from what was actually recorded.
 */
export async function submitAttendance(request: MarkAttendanceRequest): Promise<AttendanceWriteResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await AttendanceApi.submit(client, request);

    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while submitting attendance:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — keeps a partly marked day as a draft.
 *
 * Deliberately not a "submit that skips validation": the payload is the same,
 * but a draft is never checked for completeness, since being unfinished is the
 * whole reason it is being saved.
 */
export async function saveAttendanceDraft(request: MarkAttendanceRequest): Promise<AttendanceWriteResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await AttendanceApi.saveDraft(client, request);

    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while saving the attendance draft:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
