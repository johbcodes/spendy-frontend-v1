
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-dark-gray mb-1.5 transition-colors duration-200">
          {label}
        </label>}
      <input className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure focus:shadow-md focus:shadow-green-100/50 hover:border-gray-400 ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-300'} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 animate-in fade-in duration-200">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>;
}