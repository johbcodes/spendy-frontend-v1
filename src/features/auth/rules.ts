import type { SignUpData } from './types';

export function canSubmitSignUp(data: SignUpData): boolean {
  return Boolean(
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.companyName.trim() &&
    data.password.length >= 8 &&
    data.password === data.confirmPassword &&
    data.agreedToTerms
  );
}
