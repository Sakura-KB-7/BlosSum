export type BudgetType = 'income' | 'expense';

export type PaymentMethod = 'card' | 'transfer' | 'cash' | 'other';

/** json-server `/records` 한 줄 */
export interface RecordRow {
  id: number | string;
  type: BudgetType;
  date: string;
  categoryId: number;
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  memo: string;
  isFixed: boolean;
  recurringDay?: number;
}

/** 하위 호환: 거래 스토어에서 사용 */
export type BudgetRow = RecordRow;

/** json-server `/categories` */
export interface CategoryItem {
  id: number;
  name: string;
  type: BudgetType;
  color: string;
}

export interface PeriodicExpenseRow {
  id: string;
  date: string;
  type: 'expense';
  category: string;
  amount: number;
  memo: string;
}

/** json-server `/userSettings` (단일 행 권장) */
export interface UserSettingsRow {
  id: number;
  name: string;
  email: string;
  monthlyBudget: number;
  currency: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
}
