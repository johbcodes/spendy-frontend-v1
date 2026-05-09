/**
 * Storage Service
 * Centralized localStorage operations with type safety and error handling
 */

export type StorageKey =
  | 'users'
  | 'currentUser'
  | 'isAuthenticated'
  | 'spendy_wallets'
  | 'spendy_events'
  | 'spendy_expenses'
  | 'spendy_transactions'
  | 'spendy_requests'
  | 'spendy_activitylog'
  | 'spendy_payments'
  | 'spendy_suppliers'
  | 'spendy_inventory'
  | 'spendy_systemData'
  | 'spendy_notifications'
  | 'spendy_invoices'
  | 'spendy_products';

class StorageService {
  /**
   * Get item from localStorage with type safety
   */
  getItem<T>(key: StorageKey, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage with JSON serialization
   */
  setItem<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      if (this.isQuotaExceededError(error)) {
        console.error('localStorage quota exceeded. Consider clearing old data.');
      }
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  /**
   * Clear all localStorage data
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if quota exceeded error
   */
  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /**
   * Get all items with a specific prefix
   */
  getItemsByPrefix(prefix: string): Record<string, any> {
    const items: Record<string, any> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            items[key] = JSON.parse(value);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading items with prefix ${prefix}:`, error);
    }
    return items;
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage (approximate)
   */
  getUsage(): { used: number; available: number } {
    try {
      let used = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            used += key.length + value.length;
          }
        }
      }
      return {
        used: used * 2, // UTF-16 uses 2 bytes per character
        available: 5 * 1024 * 1024, // Approximate 5MB limit
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0 };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
