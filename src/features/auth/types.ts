export interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  country: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}
