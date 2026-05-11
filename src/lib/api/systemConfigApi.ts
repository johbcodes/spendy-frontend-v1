import { apiHttp } from './http';

export interface SystemConfigDTO {
  id: string;
  tariffRate: number;
  tariffFlat: number;
  updatedAt?: string;
}

export const systemConfigApi = {
  get: () => apiHttp.get<SystemConfigDTO>('/system-config'),
};
