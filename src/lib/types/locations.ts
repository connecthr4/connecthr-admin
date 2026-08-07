/**
 * A state as returned by `/locations/states`. `code` is what the districts endpoint is
 * keyed on, so it is also the value the state dropdown stores.
 */
export interface StateLocation {
  code: string;
  name: string;
}

/**
 * A district of a given state. `code` is what the employee record stores, while `name` is
 * only ever shown to the user.
 */
export interface DistrictLocation {
  code: string;
  name: string;
}

export interface GetStatesResponse {
  success: boolean;
  message: string;
  data: StateLocation[];
}

export interface GetDistrictsResponse {
  success: boolean;
  message: string;
  data: DistrictLocation[];
}

/**
 * Mirrors `GetEmployeesResult` — a plain, serializable outcome, since a Server Function
 * cannot carry `ApiError` across the client/server boundary intact.
 */
export type GetStatesResult = { success: true; data: StateLocation[] } | { success: false; message: string };

export type GetDistrictsResult = { success: true; data: DistrictLocation[] } | { success: false; message: string };
