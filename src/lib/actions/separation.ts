'use server';

import { redirect } from 'next/navigation';
import { getServerApiClient } from '../api/getServerApiClient';
import { SeparationApi } from '../api/separation';
import { NotFoundError, UnauthorizedError } from '../api/errors';
import { getApiErrorInfo } from '../api/helpers';
import { expireIfIdle } from '../auth/idleGate';
import { logger } from '../logger';
import { LOGIN_SESSION_EXPIRED_URL, ROUTES, STRINGS } from '../../constants/strings';
import type {
  DecideSeparationResult,
  GetEmployeeSeparationResult,
  GetSeparationOptionsResult,
  GetSeparationResult,
  GetSeparationsRequest,
  GetSeparationsResult,
  InitiateSeparationRequest,
  InitiateSeparationResult,
  SeparationDecisionOutcome,
} from '../types/separation';

/**
 * Server Function — the separation types the form's dropdown offers.
 *
 * The form reads its list from here rather than declaring one, since
 * {@link initiateSeparation} rejects any code outside the set the backend serves. Callers go
 * through `SeparationOptionsClient`, which keeps the list for the life of the page.
 */
export async function getSeparationOptions(): Promise<GetSeparationOptionsResult> {
  /*
  Outside the try because `redirect` throws — this fork's guide again — and before the client
  is built because `getServerApiClient` refreshes on a 401, which would revive the session
  the gate just ended.
  */
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getOptions(client);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching the separation options:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — files a separation, called straight from `SeparationForm` (a Client
 * Component) like a regular async function. Runs in a context where cookie mutation is
 * allowed (unlike a Server Component render), so a token refresh triggered here persists
 * normally.
 *
 * The message is passed straight back on both paths — the backend's own wording is what the
 * user is shown, rather than a copy of it kept in the UI that could drift from what was
 * actually recorded.
 */
export async function initiateSeparation(request: InitiateSeparationRequest): Promise<InitiateSeparationResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.initiateSeparation(client, request);

    return { success: true, message: response.message };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while initiating the separation:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — a page of filed separations, called straight from `SeparationsDashboard`
 * when the user pages the table. The route renders the first page itself, so this is only
 * reached from page two onwards.
 */
export async function getSeparations(request: GetSeparationsRequest): Promise<GetSeparationsResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getSeparations(client, request);

    /*
    Flattened out of the response's `data` envelope, so the dashboard reads
    `result.separations` rather than reaching through two wrappers for it.
    */
    return {
      success: true,
      separations: response.data.separations,
      meta: response.data.meta,
      statusCounts: response.data.statusCounts,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching the separations:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — one separation in full, for the details drawer.
 *
 * Read on open rather than with the list: the reason and the notes are free text that only
 * one row at a time is ever looked at, so fetching them for every row of every page would be
 * paying for them a page at a time and showing one. Callers go through `SeparationsClient`,
 * which keeps what it has already read for the life of the page.
 *
 * @param separationId - The separation's own id, from the row that was opened.
 */
export async function getSeparation(separationId: string): Promise<GetSeparationResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getSeparation(client, separationId);

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while fetching the separation:', error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — one employee's current separation, for the Separation section of their
 * profile.
 *
 * Keyed by the employee's "EMP1042" code, not their record id: the screen is looking for
 * whichever separation is theirs, which is a different question from
 * {@link getSeparation}'s "show me this row".
 *
 * A 404 is read as "nothing filed" rather than as an error. The endpoint answers 404 for
 * two reasons — no such employee, and an employee with no separation — and only the second
 * can happen here, since the profile has already rendered the employee's record by the time
 * this section can be opened. Most employees have never had a separation filed, so
 * surfacing that as a failure with a retry button would make the ordinary case look broken.
 *
 * @param employeeId - The "EMP1042" code, from the employee the profile is showing.
 */
export async function getEmployeeSeparation(employeeId: string): Promise<GetEmployeeSeparationResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  try {
    const client = getServerApiClient();
    const response = await SeparationApi.getEmployeeSeparation(client, employeeId);

    /* `data` is already nullable on this endpoint, so a body saying "none" needs no mapping. */
    return { success: true, data: response.data ?? null };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    if (error instanceof NotFoundError) {
      return { success: true, data: null };
    }

    logger.error("Error occurred while fetching the employee's separation:", error);
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}

/**
 * Server Function — records an approver's decision on one pending separation.
 *
 * One function over the backend's two endpoints, because from the screen's side this is one
 * action with two outcomes: the drawer offers a pair of buttons, and which endpoint that
 * lands on is a detail of the contract rather than of the decision. Splitting it in two here
 * would only push the same `if` up into the component.
 *
 * Nothing is checked before the call beyond the remarks. Who may decide — the roles above
 * ADMIN, and not one's own separation — is the backend's to enforce, and it already answers
 * it through the `permissions.canDecide` flag the screen renders its buttons off; repeating
 * the rule here would be a second opinion with nothing extra to go on.
 *
 * @param separationId - The separation's own id, from the row that was opened.
 * @param outcome - Which way it was decided, which is also the status it ends up in.
 * @param remarks - Why. Optional on an approval, required on a rejection.
 */
export async function decideSeparation(
  separationId: string,
  outcome: SeparationDecisionOutcome,
  remarks?: string
): Promise<DecideSeparationResult> {
  if (await expireIfIdle()) {
    redirect(LOGIN_SESSION_EXPIRED_URL);
  }

  const trimmedRemarks = remarks?.trim();

  /*
  Checked here as well as in the modal, because a Server Function is a POST endpoint of its
  own and is reachable without going anywhere near the drawer. The backend enforces it a
  third time and is the only one of the three that is load-bearing — this one just saves a
  round trip to be told something this side already knew.
  */
  if (outcome === 'REJECTED' && !trimmedRemarks) {
    return { success: false, message: STRINGS.REJECTION_REMARKS_REQUIRED };
  }

  try {
    const client = getServerApiClient();

    const response =
      outcome === 'APPROVED'
        ? await SeparationApi.approveSeparation(client, separationId, trimmedRemarks ? { remarks: trimmedRemarks } : {})
        : await SeparationApi.rejectSeparation(client, separationId, { remarks: trimmedRemarks });

    return { success: true, message: response.message, data: response.data };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect(ROUTES.LOGIN);
    }

    logger.error('Error occurred while deciding the separation:', error);

    /*
    The backend's own wording, which matters more here than anywhere else in the module: a
    403 for deciding one's own separation, or a separation someone else has already decided,
    is something the approver needs told in the API's words rather than in a generic failure.
    */
    const { message } = getApiErrorInfo(error);

    return { success: false, message };
  }
}
