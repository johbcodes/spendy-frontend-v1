
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-dark-gray mb-1.5 transition-colors duration-200">
          {label}
        </label>}
      <select className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure focus:shadow-md focus:shadow-green-100/50 hover:border-gray-400 cursor-pointer ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-300'} ${className}`} {...props}>
        {options.map(option => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 animate-in fade-in duration-200">{error}</p>}
    </div>;
}