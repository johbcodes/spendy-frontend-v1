import { describe, it, expect } from 'vitest';
import {
  canDeleteUser,
  canEditUser,
  canToggleUserStatus,
  getRoleVariant,
  validateUserData,
  getDefaultModulesForRole,
  hasModuleAccess,
  isUserActive,
  getUserFullName
} from '../rules';
import { filterUsers, getUsersByRole, getActiveUsers, toggleUserStatus } from '../api';
import { User } from '../types';

describe('Users Rules', () => {
  const adminUser: User = {
    id: 'admin-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '1234567890',
    country: 'Kenya',
    role: 'Admin',
    status: 'Active',
    modulesAssigned: ['All'],
    createdAt: '2024-01-01',
    companyName: 'Test Company',
    isAdmin: true,
    password: ''
  };

  const staffUser: User = {
    id: 'staff-1',
    firstName: 'Staff',
    lastName: 'User',
    email: 'staff@example.com',
    phone: '0987654321',
    country: 'Kenya',
    role: 'Staff',
    status: 'Active',
    modulesAssigned: ['Expenses', 'Payments'],
    createdAt: '2024-01-01',
    companyName: 'Test Company',
    isAdmin: false,
    password: ''
  };

  describe('canDeleteUser', () => {
    it('should not allow deleting yourself', () => {
      expect(canDeleteUser(adminUser, adminUser)).toBe(false);
    });

    it('should not allow deleting admin users', () => {
      expect(canDeleteUser(adminUser, staffUser)).toBe(false);
    });

    it('should allow admin to delete non-admin users', () => {
      expect(canDeleteUser(staffUser, adminUser)).toBe(true);
    });

    it('should not allow non-admin to delete users', () => {
      expect(canDeleteUser(adminUser, staffUser)).toBe(false);
    });
  });

  describe('canEditUser', () => {
    it('should allow admin to edit any user', () => {
      expect(canEditUser(staffUser, adminUser)).toBe(true);
    });

    it('should allow users to edit themselves', () => {
      expect(canEditUser(staffUser, staffUser)).toBe(true);
    });

    it('should not allow non-admin to edit other users', () => {
      const anotherStaff: User = { ...staffUser, id: 'staff-2' };
      expect(canEditUser(anotherStaff, staffUser)).toBe(false);
    });
  });

  describe('canToggleUserStatus', () => {
    it('should not allow toggling your own status', () => {
      expect(canToggleUserStatus(adminUser, adminUser)).toBe(false);
    });

    it('should not allow toggling admin status', () => {
      expect(canToggleUserStatus(adminUser, staffUser)).toBe(false);
    });

    it('should allow admin to toggle non-admin status', () => {
      expect(canToggleUserStatus(staffUser, adminUser)).toBe(true);
    });
  });

  describe('getRoleVariant', () => {
    it('should return correct variants for roles', () => {
      expect(getRoleVariant('Admin')).toBe('danger');
      expect(getRoleVariant('Approver')).toBe('warning');
      expect(getRoleVariant('Staff')).toBe('info');
      expect(getRoleVariant('Store Manager')).toBe('success');
    });
  });

  describe('validateUserData', () => {
    it('should validate correct user data', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'Staff' as const,
        modulesAssigned: ['Expenses']
      };
      const result = validateUserData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const data = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        modulesAssigned: []
      };
      const result = validateUserData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for invalid email', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '1234567890',
        role: 'Staff' as const,
        modulesAssigned: ['Expenses']
      };
      const result = validateUserData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });
  });

  describe('getDefaultModulesForRole', () => {
    it('should return correct default modules for each role', () => {
      expect(getDefaultModulesForRole('Admin')).toEqual(['All']);
      expect(getDefaultModulesForRole('Staff')).toEqual(['Expenses', 'Payments']);
      expect(getDefaultModulesForRole('Store Manager')).toEqual(['Inventory', 'Expenses']);
      expect(getDefaultModulesForRole('Approver')).toEqual(['Events', 'Approvals']);
    });
  });

  describe('hasModuleAccess', () => {
    it('should allow admin access to all modules', () => {
      expect(hasModuleAccess(adminUser, 'Expenses')).toBe(true);
      expect(hasModuleAccess(adminUser, 'Payments')).toBe(true);
    });

    it('should check module access for non-admin users', () => {
      expect(hasModuleAccess(staffUser, 'Expenses')).toBe(true);
      expect(hasModuleAccess(staffUser, 'Payments')).toBe(true);
      expect(hasModuleAccess(staffUser, 'Inventory')).toBe(false);
    });
  });

  describe('getUserFullName', () => {
    it('should return full name', () => {
      expect(getUserFullName(staffUser)).toBe('Staff User');
    });
  });
});

describe('Users API', () => {
  const users: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      country: 'Kenya',
      role: 'Admin',
      status: 'Active',
      modulesAssigned: ['All'],
      createdAt: '2024-01-01',
      companyName: 'Test Company',
      isAdmin: true,
      password: ''
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      country: 'Kenya',
      role: 'Staff',
      status: 'Active',
      modulesAssigned: ['Expenses', 'Payments'],
      createdAt: '2024-01-02',
      companyName: 'Test Company',
      isAdmin: false,
      password: ''
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      phone: '5555555555',
      country: 'Kenya',
      role: 'Store Manager',
      status: 'Inactive',
      modulesAssigned: ['Inventory', 'Expenses'],
      createdAt: '2024-01-03',
      companyName: 'Test Company',
      isAdmin: false,
      password: ''
    }
  ];

  describe('filterUsers', () => {
    it('should filter by search term', () => {
      const result = filterUsers(users, 'john', undefined, undefined);
      expect(result).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should filter by role', () => {
      const result = filterUsers(users, '', 'Staff', undefined);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('Staff');
    });

    it('should filter by status', () => {
      const result = filterUsers(users, '', undefined, 'Active');
      expect(result).toHaveLength(2);
      expect(result.every(u => u.status === 'Active')).toBe(true);
    });

    it('should filter by multiple criteria', () => {
      const result = filterUsers(users, 'jane', 'Staff', 'Active');
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('Jane');
    });
  });

  describe('getUsersByRole', () => {
    it('should return users with specific role', () => {
      const admins = getUsersByRole(users, 'Admin');
      expect(admins).toHaveLength(1);
      expect(admins[0].role).toBe('Admin');
    });
  });

  describe('getActiveUsers', () => {
    it('should return only active users', () => {
      const active = getActiveUsers(users);
      expect(active).toHaveLength(2);
      expect(active.every(u => u.status === 'Active')).toBe(true);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status from Active to Inactive', () => {
      const user = users[1];
      const toggled = toggleUserStatus(user);
      expect(toggled.status).toBe('Inactive');
    });

    it('should toggle user status from Inactive to Active', () => {
      const user = users[2];
      const toggled = toggleUserStatus(user);
      expect(toggled.status).toBe('Active');
    });
  });
});
