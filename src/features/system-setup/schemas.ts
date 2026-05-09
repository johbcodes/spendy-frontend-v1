export function validateCategoryName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  return null;
}

export function validateClientForm(data: {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}): string[] {
  const errors: string[] = [];
  if (!data.name?.trim()) errors.push('Client name is required');
  if (!data.contactPerson?.trim()) errors.push('Contact person is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.phone?.trim()) errors.push('Phone is required');
  return errors;
}
