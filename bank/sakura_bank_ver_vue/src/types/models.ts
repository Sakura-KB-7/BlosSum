export type BudgetType = 'income' | 'expense';

/** 과제 샘플 필드명 정렬 (detailCategory, amount). id는 문자열. */
export interface BudgetRow {
  id: string;
  date: string;
  type: BudgetType;
  category: string;
  detailCategory: string;
  amount: number;
  memo: string;
}

/** 가이드의 incomeCategory / expenseCategory: 문자열 배열 대신 json-server용 객체 배열 권장 */
export interface CategoryItem {
  id: string;
  name: string;
}

export interface PeriodicExpenseRow {
  id: string;
  date: string;
  type: 'expense';
  category: string;
  amount: number;
  memo: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
}
