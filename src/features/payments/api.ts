import { paymentsAPI } from '../../services/api';
import type { Payment } from '../../types';

export const paymentFeatureApi = {
  list: (): Promise<Payment[]> => paymentsAPI.getAll(),
  create: (data: Partial<Payment>): Promise<Payment> => paymentsAPI.create(data),
};
