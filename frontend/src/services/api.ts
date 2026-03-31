import {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
  expenseApi,
} from "../api/client";

export const dashboardApi = {
  listExpenses: (): Promise<Expense[]> => expenseApi.list(),
  createExpense: (payload: CreateExpenseInput): Promise<Expense> => expenseApi.create(payload),
  updateExpense: (expenseId: number, payload: UpdateExpenseInput): Promise<Expense> =>
    expenseApi.edit(expenseId, payload),
  deleteExpense: (expenseId: number): Promise<void> => expenseApi.delete(expenseId),
};
