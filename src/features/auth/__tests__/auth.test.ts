import { describe, expect, it } from 'vitest';
import { canSubmitSignUp, mapSignUpToUserDraft, validateSignIn, validateSignUp } from '..';
import type { SignUpData } from '../types';

const validSignUp: SignUpData = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+254700000000',
  companyName: 'Analytical Events',
  country: 'Kenya',
  password: 'password123',
  confirmPassword: 'password123',
  agreedToTerms: true,
};

describe('auth feature', () => {
  it('validates sign in data', () => {
    expect(validateSignIn({ email: '', password: '', rememberMe: false })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('validates and gates sign up data', () => {
    expect(validateSignUp(validSignUp)).toEqual({});
    expect(canSubmitSignUp(validSignUp)).toBe(true);
    expect(canSubmitSignUp({ ...validSignUp, confirmPassword: 'different' })).toBe(false);
  });

  it('maps sign up data to a user draft', () => {
    expect(mapSignUpToUserDraft(validSignUp)).toMatchObject({
      email: 'ada@example.com',
      companyName: 'Analytical Events',
    });
  });
});
