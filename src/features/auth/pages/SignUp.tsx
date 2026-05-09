import { useState } from 'react';
import { Logo } from '../../../components/ui/Logo';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Button } from '../../../components/ui/Button';

interface SignUpProps {
  onSignUp: (data: SignUpData) => void;
  onNavigateToSignIn: () => void;
  countries: string[];
}

export interface SignUpData {
  // Personal KYC
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Company KYC
  companyName: string;
  country: string;
  // Authentication
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export function SignUp({ onSignUp, onNavigateToSignIn, countries }: SignUpProps) {
  const [formData, setFormData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    country: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms and Privacy Policy';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSignUp(formData);
  };

  const handleChange = (field: keyof SignUpData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <Logo className="mb-8" />

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Join thousands of event organizers across Africa</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@company.com"
              required
            />

            <PhoneInput
              label="Phone Number"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              placeholder="7XXXXXXXX"
              required
            />

            {/* Company Information */}
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Acme Events Ltd"
              required
            />

            <Select
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              options={[
                { value: '', label: 'Select country' },
                ...countries.map(c => ({ value: c, label: c }))
              ]}
              required
            />

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                  className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary/80 font-medium">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary/80 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-red-600 text-sm mt-1">{errors.agreedToTerms}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignIn}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Spendy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
