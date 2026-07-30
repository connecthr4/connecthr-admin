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

    CREATE: '/employees',

    GET_BY_ID: (id: string) => `/employees/${id}`,

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
} as const;
