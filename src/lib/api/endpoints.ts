export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',

    CHANGE_PASSWORD: '/auth/change-password',

    LOGOUT: '/auth/logout',

    REFRESH: '/auth/refresh-token',

    PROFILE: '/auth/profile',
  },

  EMPLOYEE: {
    GET_ALL: '/employees',

    CREATE: '/employees',

    GET_BY_ID: (id: string) => `/employees/${id}`,

    UPDATE: (id: string) => `/employees/${id}`,

    DELETE: (id: string) => `/employees/${id}`,
  },

  DEPARTMENT: {
    GET_ALL: '/departments',

    CREATE: '/departments',
  },

  HOLIDAY: {
    GET_ALL: '/holidays',
  },
} as const;
