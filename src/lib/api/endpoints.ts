export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',

    CHANGE_PASSWORD: '/auth/change-password',

    LOGOUT: '/auth/logout',

    REFRESH: '/auth/refresh',

    PROFILE: '/auth/profile',

    ME: '/auth/me',
  },

  USERS: {
    CREATE: '/users',

    LIST: '/users',

    ASSIGNABLE_ROLES: '/users/assignable-roles',
  },

  DASHBOARD: {
    GET_SUMMARY: '/dashboard/summary',
  },

  EMPLOYEE: {
    GET_ALL: '/employees',

    LIST: '/employees',

    GET_COLUMNS: '/employees/columns',

    FILTER_OPTIONS: '/employees/filter-options',

    CREATE: '/employees/create',

    GET_BY_ID: (id: string) => `/employees/${encodeURIComponent(id)}`,

    UPDATE: (id: string) => `/employees/${encodeURIComponent(id)}`,

    DELETE: (id: string) => `/employees/${id}`,

    EXPORT: '/employees/export',
  },

  DEPARTMENT: {
    GET_ALL: '/departments',

    CREATE: '/departments',
  },

  ATTENDANCE: {
    /**
     * A POST rather than a GET: the sheet is scoped by a date, a search term
     * and repeatable department and shift filters, which travel as a body the
     * same way the employee list's criteria do.
     */
    SHEET: '/attendance/sheet',

    /**
     * Every option the module's dropdowns offer — statuses, shifts and
     * departments — in one read, so the three lists can never disagree about
     * what the backend will accept.
     */
    OPTIONS: '/attendance/options',

    /**
     * A whole day's markings in one write — the date plus one record per
     * employee — so a sheet marked across several pages is recorded as a single
     * transaction rather than a row at a time.
     */
    SUBMIT: '/attendance/submit',

    /**
     * The same payload as {@link SUBMIT}, kept as work in progress: a partly
     * marked day is stored server-side, so the draft survives the browser and
     * comes back on the sheet wherever it is next opened.
     */
    DRAFT: '/attendance/draft',

    /**
     * A day's records as an Excel file. Takes the sheet's own criteria plus a
     * scope, so the file is either the whole roster for the day or exactly the
     * listing on screen.
     */
    EXPORT: '/attendance/export',

    /**
     * One employee's whole attendance history — the mirror image of
     * {@link SHEET}, which is one day of every employee.
     *
     * A GET rather than a POST: the employee is the only thing it is scoped by,
     * and it comes back whole rather than a page at a time.
     */
    BY_EMPLOYEE: (employeeId: string) => `/attendance/employees/${encodeURIComponent(employeeId)}`,
  },

  SHIFTS: {
    GET_ALL: '/shifts',
  },

  SEPARATION: {
    /**
     * Every option the separation form's dropdowns offer, in one read — today
     * just the separation types, but shaped as a bag of lists the way
     * {@link ATTENDANCE.OPTIONS} is, so a second list costs no new endpoint.
     *
     * Read from the separation module's own endpoint rather than the shared
     * `/options/employee/{field}` one: these are the codes {@link CREATE}
     * accepts, and nothing else may disagree with them.
     */
    OPTIONS: '/separations/options',

    /**
     * Files one separation — the whole record in a single write, since a
     * half-filed exit is not something the backend or this form could
     * reconcile afterwards.
     */
    CREATE: '/separations',
  },

  OPTIONS: {
    /**
     * The values one employee field may be filled with — department, gender and marital
     * status among them — so the dropdowns offering them can never disagree with what the
     * create and update endpoints accept.
     */
    GET_EMPLOYEE_OPTIONS: (field: string) => `/options/employee/${encodeURIComponent(field)}`,
  },

  HOLIDAYS: {
    GET_HOLIDAYS_LIST: '/holidays',

    CREATE_HOLIDAY: '/holidays',

    DELETE_HOLIDAY: (id: string) => `/holidays/${id}`,

    EXPORT_HOLIDAYS: '/holidays/export',
  },

  LOCATIONS: {
    GET_STATES: '/locations/states',

    GET_DISTRICTS: (stateCode: string) => `/locations/states/${encodeURIComponent(stateCode)}/districts`,
  },

  COMMON: {
    GET_FILTERS: (module: string) => `/filters/${module}`,
  },
} as const;
