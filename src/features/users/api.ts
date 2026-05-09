import { User, UserRole } from './types';

export function filterUsers(
  users: User[],
  searchTerm: string,
  roleFilter?: string,
  statusFilter?: string
): User[] {
  return users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function getUsersByRole(users: User[], role: UserRole): User[] {
  return users.filter(u => u.role === role);
}

export function getActiveUsers(users: User[]): User[] {
  return users.filter(u => u.status === 'Active');
}

export function createUser(data: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    country: data.country || '',
    role: data.role || 'Staff',
    status: data.status || 'Active',
    modulesAssigned: data.modulesAssigned || [],
    createdAt: now,
    companyId: data.companyId,
    companyName: data.companyName,
    isAdmin: data.role === 'Admin',
    ...data
  } as User;
}

export function updateUser(user: User, updates: Partial<User>): User {
  return {
    ...user,
    ...updates,
    isAdmin: updates.role === 'Admin' ? true : user.isAdmin
  };
}

export function toggleUserStatus(user: User): User {
  return {
    ...user,
    status: user.status === 'Active' ? 'Inactive' : 'Active'
  };
}
