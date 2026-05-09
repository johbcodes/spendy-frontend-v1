import type { SignUpData } from './types';

export function mapSignUpToUserDraft(data: SignUpData) {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    companyName: data.companyName,
    country: data.country,
    password: data.password,
  };
}
