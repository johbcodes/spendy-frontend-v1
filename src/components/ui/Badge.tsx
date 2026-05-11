
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'error';
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}
export function Badge({
  children,
  variant = 'default',
  className = ''
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 hover:shadow-sm',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 hover:shadow-sm',
    danger: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 hover:shadow-sm',
    error: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 hover:shadow-sm',
    info: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 hover:shadow-sm',
    primary: 'bg-azure/10 text-azure border border-azure/30 hover:bg-azure/20 hover:shadow-sm',
    default: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ease-in-out ${variantStyles[variant]} ${className}`}>
      {children}
    </span>;
}