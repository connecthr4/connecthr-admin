/**
 * Shared shapes for `/filters/:module`. Nothing here names a specific field —
 * each module decides which filters it exposes, so the same types cover every
 * module's response.
 */

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  /**
   * The field this group filters on — sent back as `field` in a list
   * request's `filters` array.
   */
  id: string;

  label: string;

  /**
   * Whether more than one option can be selected at once. When false,
   * choosing an option replaces the group's current selection.
   */
  isMulti: boolean;

  options: FilterOption[];
}

/**
 * One entry per filterable field, in the order the backend wants them shown.
 */
export type FilterOptions = FilterGroup[];

export interface GetFiltersResponse {
  success: boolean;
  message: string;
  data: FilterOptions;
}
