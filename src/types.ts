export type CategoryType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g., 'Wallet', 'Utensils', 'Car'
  color: string; // Hex color
  type: CategoryType;
}

export type RecurringPeriod = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Transaction {
  id: string;
  amount: number;
  notes: string;
  transaction_date: string; // YYYY-MM-DD
  type: CategoryType;
  category_id: string;
  is_recurring: boolean;
  recurring_period: RecurringPeriod;
}

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // YYYY-MM-DD
}

export interface Budget {
  id: string;
  category_id: string;
  monthly_limit: number;
}

export type AssetType = 'CASH' | 'STOCK' | 'MUTUAL_FUND' | 'GOLD' | 'CRYPTO' | 'PROPERTY';

export interface Asset {
  id: string;
  name: string;
  asset_type: AssetType;
  value: number;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
}

export interface WealthData {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  assets: Asset[];
  liabilities: Liability[];
}
