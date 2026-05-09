// Pages
export { Analytics } from './pages/Analytics';

// Utils
export { 
  calculateEventProfitLoss as calculateProfitLoss,
  formatCurrency as formatReportCurrency,
  getProfitLossColor 
} from './utils/profitLoss';

// Hooks
export { 
  useFilteredData, 
  useReportMetrics, 
  useChartData,
  useReportFilters 
} from './hooks';

// Rules
export {
  calculateBusinessMetrics,
  calculateApprovalMetrics,
  calculateWalletMetrics,
  calculateSupplierPaymentMetrics,
  calculatePaymentStatusBreakdown,
  calculateEventProfitLoss,
  formatCurrency,
  getProfitLossColor as getProfitColor
} from './rules';

// API
export {
  filterExpensesByDateRange,
  filterEventsByTypeAndClient,
  calculateMonthlyExpenseTrend,
  calculateCategoryBreakdown,
  calculateEventCostBreakdown,
  calculateBudgetVsActual,
  calculateExpenseByEventType,
  getUniqueClients
} from './api';

// Mappers
export {
  mapMonthlyTrendToExportData,
  mapCategoryBreakdownToExportData,
  mapEventCostBreakdownToExportData
} from './mappers';

// Schemas
export { validateDateRange } from './schemas';

// Types
export type {
  ReportFilters,
  BusinessMetrics,
  ApprovalMetrics,
  WalletMetrics,
  SupplierPaymentMetrics,
  MonthlyTrendData,
  CategoryBreakdown,
  EventCostBreakdown,
  EventProfitLoss
} from './types';
