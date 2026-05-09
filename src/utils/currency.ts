export const EAST_AFRICAN_CURRENCIES = [{
  code: 'KES',
  symbol: 'KSh',
  name: 'Kenyan Shilling',
  country: 'Kenya'
}, {
  code: 'UGX',
  symbol: 'USh',
  name: 'Ugandan Shilling',
  country: 'Uganda'
}, {
  code: 'TZS',
  symbol: 'TSh',
  name: 'Tanzanian Shilling',
  country: 'Tanzania'
}, {
  code: 'RWF',
  symbol: 'FRw',
  name: 'Rwandan Franc',
  country: 'Rwanda'
}, {
  code: 'BIF',
  symbol: 'FBu',
  name: 'Burundian Franc',
  country: 'Burundi'
}];
export function formatCurrency(amount: number, currencyCode = 'KES'): string {
  const currency = EAST_AFRICAN_CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || 'KSh';
  return `${symbol} ${amount.toLocaleString()}`;
}
export function getCurrencySymbol(currencyCode = 'KES'): string {
  const currency = EAST_AFRICAN_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || 'KSh';
}