/**
 * The shifts an employee can be put on, as `/shifts` lists them.
 */

/**
 * One shift. `code` is what the backend stores and what an attendance row
 * carries; `name` is what a user is shown.
 */
export interface Shift {
  code: string;
  name: string;
}

export interface GetShiftsResponse {
  success: boolean;
  message: string;
  data: Shift[];
}

/**
 * Mirrors the other Server Function results — a plain, serializable outcome,
 * since a Server Function cannot carry `ApiError` across the client/server
 * boundary intact.
 */
export type GetShiftsResult = { success: true; data: Shift[] } | { success: false; message: string };
