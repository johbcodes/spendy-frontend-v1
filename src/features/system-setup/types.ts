import type {
  Category as AppCategory,
  CategoryType,
  Client as AppClient,
  User,
} from '../../types';

export type Category = AppCategory & {
  status?: string;
  dateCreated?: string;
};

export type Client = AppClient & {
  dateCreated?: string;
};

export interface SystemItem {
  id: string;
  name: string;
  status?: string;
  dateCreated?: string;
}

export interface SystemSetupData {
  events: Category[];
  activations: Category[];
  expenses: Category[];
  operations: Category[];
  suppliers: Category[];
  inventory: Category[];
  clients: Client[];
}

export type { CategoryType, User };
