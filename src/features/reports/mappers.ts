import { MonthlyTrendData } from './types';

export function mapMonthlyTrendToExportData(data: MonthlyTrendData[]) {
  return data.map(item => ({
    'Month': item.month,
    'Operational Expenses': item.ops,
    'Project Expenses': item.events,
    'Total': item.ops + item.events
  }));
}

export function mapCategoryBreakdownToExportData(data: Array<{ name: string; value: number }>) {
  return data.map(item => ({
    'Category': item.name,
    'Amount': item.value
  }));
}

export function mapEventCostBreakdownToExportData(data: Array<{
  event: string;
  venue: number;
  manpower: number;
  transport: number;
  marketing: number;
  misc: number;
}>) {
  return data.map(item => ({
    'Event': item.event,
    'Venue': item.venue,
    'Manpower': item.manpower,
    'Transport': item.transport,
    'Marketing': item.marketing,
    'Miscellaneous': item.misc,
    'Total': item.venue + item.manpower + item.transport + item.marketing + item.misc
  }));
}
