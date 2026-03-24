import { Expense } from "../api/client";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (expenseId: number) => Promise<void>;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <h2>Recent expenses</h2>
        <span>{expenses.length} items</span>
      </div>

      {expenses.length === 0 ? (
        <p className="empty-state">No expenses yet.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <div>
                <strong>{expense.title}</strong>
                <p>{new Date(expense.created_at).toLocaleString()}</p>
                <button type="button" onClick={() => void onDelete(expense.id)}>
                  Delete
                </button>
              </div>
              <span>${expense.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
