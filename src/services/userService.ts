/**
 * User Service
 * Handles all user-related data operations using backend API
 */

import { User } from '../types';
import { userAPI, User as BackendUser } from './backendAPI';

class UserService {
  /**
   * Convert backend user to app user format
   */
  private convertToAppUser(backendUser: BackendUser): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      phone: backendUser.phone || '',
      country: backendUser.country || '',
      role: backendUser.role,
      status: backendUser.status,
      modulesAssigned: backendUser.modulesAssigned || [],
      createdAt: backendUser.createdAt,
      companyName: '',
      isAdmin: backendUser.role === 'Admin',
      password: ''
    };
  }

  /**
   * Get all users from backend
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await userAPI.getAll();
      return response.data.map(u => this.convertToAppUser(u));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | undefined> {
    try {
      const response = await userAPI.getById(userId);
      return this.convertToAppUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return undefined;
    }
  }

  /**
   * Create a new user
   */
  async createUser(user: Partial<User> & { password: string }): Promise<User> {
    try {
      const response = await userAPI.create({
        email: user.email!,
        password: user.password,
        firstName: user.firstName!,
        lastName: user.lastName!,
        phone: user.phone || '',
        country: user.country || '',
        role: user.role!,
        modulesAssigned: user.modulesAssigned
      });
      return this.convertToAppUser(response.data);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await userAPI.update(userId, {
        email: updates.email,
        firstName: updates.firstName,
        lastName: updates.lastName,
        phone: updates.phone,
        country: updates.country,
        role: updates.role,
        status: updates.status,
        modulesAssigned: updates.modulesAssigned
      });
      return this.convertToAppUser(response.data);
    } catch (error) {
      console.error('Failed to update user:', error);
      return null;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await userAPI.delete(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(userId: string, status: 'Active' | 'Inactive'): Promise<User | null> {
    try {
      const response = await userAPI.toggleStatus(userId, status);
      return this.convertToAppUser(response.data);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      return null;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.role === role);
  }

  /**
   * Get active users
   */
  async getActiveUsers(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.status === 'Active');
  }
}

export const userService = new UserService();
