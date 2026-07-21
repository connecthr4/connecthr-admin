import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/auth';

export const AuthApi = {
  login(data: LoginRequest) {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  changePassword(data: ChangePasswordRequest) {
    return apiClient.post<ChangePasswordRequest>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  //   logout() {
  //     return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  //   },

  //   refresh() {
  //     return apiClient.post<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH);
  //   },

  //   me() {
  //     return apiClient.get<MeResponse>(API_ENDPOINTS.AUTH.ME);
  //   },
};
