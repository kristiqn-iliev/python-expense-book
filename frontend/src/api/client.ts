export interface Expense {
  id: number;
  title: string;
  amount: string;
  created_at: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const expenseApi = {
  list: () => request<Expense[]>("/expenses"),
  create: (payload: CreateExpenseInput) =>
    request<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  delete: (expenseId: number) =>
    request<void>(`/expenses/${expenseId}`, {
      method: "DELETE",
    }),
};
