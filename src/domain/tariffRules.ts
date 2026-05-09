export interface TariffConfig {
  tariffRate: number;
  tariffFlat: number;
}

export interface TariffDecision {
  applies: boolean;
  fee: number;
  chargedToWalletId?: string;
}

export function calculateTariff(amount: number, config: TariffConfig): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const percentageFee = amount * Math.max(0, config.tariffRate);
  return Math.max(0, Math.round((percentageFee + Math.max(0, config.tariffFlat)) * 100) / 100);
}

export function getOutboundPaymentTariff(params: {
  amount: number;
  sourceWalletId?: string;
  isExternalPayee: boolean;
  config: TariffConfig;
}): TariffDecision {
  if (!params.isExternalPayee) return { applies: false, fee: 0 };

  return {
    applies: true,
    fee: calculateTariff(params.amount, params.config),
    chargedToWalletId: params.sourceWalletId,
  };
}
