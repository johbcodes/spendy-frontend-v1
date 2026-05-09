import { apiHttp, tokenStore } from './http';
import type { AuthResponseDTO, AuthUserDTO } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  companyName: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}

function persistAuth(response: AuthResponseDTO): AuthResponseDTO {
  const accessToken = response.accessToken || response.token;
  if (accessToken) tokenStore.setTokens(accessToken, response.refreshToken);
  localStorage.setItem('currentUser', JSON.stringify(response.user));
  localStorage.setItem('isAuthenticated', 'true');
  return response;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponseDTO> {
    return persistAuth(await apiHttp.post<AuthResponseDTO>('/auth/register', payload));
  },

  async login(payload: LoginPayload): Promise<AuthResponseDTO> {
    return persistAuth(await apiHttp.post<AuthResponseDTO>('/auth/login', payload));
  },

  refresh(refreshToken: string): Promise<AuthResponseDTO> {
    return apiHttp.post<AuthResponseDTO>('/auth/refresh', { refreshToken });
  },

  async logout(): Promise<void> {
    try {
      await apiHttp.post('/auth/logout');
    } finally {
      tokenStore.clear();
    }
  },

  me(): Promise<AuthUserDTO> {
    return apiHttp.get<AuthUserDTO>('/auth/me');
  },
};
