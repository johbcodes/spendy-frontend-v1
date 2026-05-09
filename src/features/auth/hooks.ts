import { useState } from 'react';
import type { SignInData } from './types';

export function useSignInForm(initial?: Partial<SignInData>) {
  return useState<SignInData>({
    email: initial?.email || '',
    password: initial?.password || '',
    rememberMe: initial?.rememberMe || false,
  });
}
