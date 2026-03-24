import { useEffect, useState } from "react";

import { CreateExpenseInput, Expense, expenseApi } from "../api/client";
import { ExpenseForm } from "../components/ExpenseForm";
import { ExpenseList } from "../components/ExpenseList";

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadExpenses() {
    try {
      setError(null);
      setIsLoading(true);
      const data = await expenseApi.list();
      setExpenses(data);
    } catch (requestError) {
      setError("Could not load expenses.");
      console.error(requestError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateExpense(payload: CreateExpenseInput) {
    try {
      setError(null);
      await expenseApi.create(payload);
      await loadExpenses();
    } catch (requestError) {
      setError("Could not save the expense.");
      console.error(requestError);
    }
  }

  async function handleDeleteExpense(expenseId: number) {
    try {
      setError(null);
      await expenseApi.delete(expenseId);
      await loadExpenses();
    } catch (requestError) {
      setError("Could not delete the expense.");
      console.error(requestError);
    }
  }

  useEffect(() => {
    void loadExpenses();
  }, []);

  return (
    <main className="layout">
      <section className="hero">
        <p className="eyebrow">Expense Book Starter</p>
        <h1>Minimal full-stack foundation for building your expense tracker.</h1>
        <p className="hero-copy">
          This page intentionally does very little: it proves the API, frontend,
          and project structure are wired together.
        </p>
      </section>

      {error ? <p className="message error">{error}</p> : null}
      {isLoading ? <p className="message">Loading expenses...</p> : null}

      <div className="content-grid">
        <ExpenseForm onSubmit={handleCreateExpense} />
        <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
      </div>
    </main>
  );
}
