export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',

    CHANGE_PASSWORD: '/auth/change-password',

    LOGOUT: '/auth/logout',

    REFRESH: '/auth/refresh',

    PROFILE: '/auth/profile',
  },

  EMPLOYEE: {
    GET_ALL: '/employees',

    LIST: '/employees',

    GET_COLUMNS: '/employees/columns',

    FILTER_OPTIONS: '/employees/filter-options',

    CREATE: '/employees/create',

    GET_BY_ID: (id: string) => `/employees/${encodeURIComponent(id)}`,

    UPDATE: (id: string) => `/employees/${id}`,

    DELETE: (id: string) => `/employees/${id}`,
  },

  DEPARTMENT: {
    GET_ALL: '/departments',

    CREATE: '/departments',
  },

  HOLIDAYS: {
    GET_HOLIDAYS_LIST: '/holidays',

    CREATE_HOLIDAY: '/holidays',

    DELETE_HOLIDAY: (id: string) => `/holidays/${id}`,
  },

  LOCATIONS: {
    GET_STATES: '/locations/states',

    GET_DISTRICTS: (stateCode: string) => `/locations/states/${encodeURIComponent(stateCode)}/districts`,
  },

  COMMON: {
    GET_FILTERS: (module: string) => `/filters/${module}`,
  },
} as const;
