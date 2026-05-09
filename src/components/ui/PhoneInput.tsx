import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

// East African country codes
const COUNTRY_CODES = [
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '7XXXXXXXX',
  label,
  helperText,
  required = false,
  error,
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract country code from value or use default
  const getCountryCodeFromValue = () => {
    const match = value.match(/^\+\d{1,3}/);
    if (match) {
      const codeObj = COUNTRY_CODES.find(c => c.code === match[0]);
      return codeObj || COUNTRY_CODES[0];
    }
    return COUNTRY_CODES[0]; // Kenya default
  };

  const currentCountry = getCountryCodeFromValue();

  const handleCodeChange = (newCode: string) => {
    // Remove old country code if present, add new one
    const numberOnly = value.replace(/^\+\d{1,3}/, '');
    onChange(newCode + numberOnly);
    setIsDropdownOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Remove any non-digit characters from the number part
    input = input.replace(/\D/g, '');
    // Combine country code with number
    onChange(currentCountry.code + input);
  };

  // Extract just the number part (without country code)
  const numberOnly = value.replace(/^\+\d{1,3}/, '');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative w-32">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between gap-2 text-sm font-medium transition-colors ${
              disabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:bg-gray-50 cursor-pointer'
            } ${error ? 'border-red-500' : ''}`}
          >
            <span>{currentCountry.flag} {currentCountry.code}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCodeChange(country.code)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 ${
                    currentCountry.code === country.code
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <span>{country.flag}</span>
                  <span className="font-medium">{country.code}</span>
                  <span className="text-gray-600 text-xs">{country.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={numberOnly}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
            disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
              : 'bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
