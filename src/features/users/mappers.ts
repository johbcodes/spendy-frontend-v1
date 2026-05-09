import { User } from './types';

export function mapUserToExportData(user: User) {
  return {
    'Name': `${user.firstName} ${user.lastName}`,
    'Email': user.email,
    'Phone': user.phone,
    'Country': user.country,
    'Role': user.role,
    'Status': user.status,
    'Modules Assigned': user.modulesAssigned.join(', '),
    'Created At': user.createdAt,
    'Last Login': user.lastLogin || 'Never'
  };
}

export function mapUsersToExportData(users: User[]) {
  return users.map(mapUserToExportData);
}

export function mapUserToFormData(user: User) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    role: user.role,
    status: user.status,
    modulesAssigned: user.modulesAssigned,
    eventAccess: user.eventAccess
  };
}

export function mapUserToCredentials(user: User) {
  return {
    email: user.email,
    password: user.password || 'Not available',
    role: user.role,
    name: `${user.firstName} ${user.lastName}`
  };
}
