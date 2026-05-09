import type { SignInData, SignUpData } from './types';

export function validateSignIn(data: SignInData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.email.trim()) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return errors;
}

export function validateSignUp(data: SignUpData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  if (!data.companyName.trim()) errors.companyName = 'Company name is required';
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (data.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!data.agreedToTerms) errors.agreedToTerms = 'You must agree to the Terms and Privacy Policy';
  return errors;
}
