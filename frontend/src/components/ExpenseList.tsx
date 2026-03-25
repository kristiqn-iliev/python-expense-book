import { useState } from "react";

import { Expense, UpdateExpenseInput } from "../api/client";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (expenseId: number) => Promise<void>;
  onEdit: (expenseId: number, payload: UpdateExpenseInput) => Promise<void>;
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function startEditing(expense: Expense) {
    setEditingExpenseId(expense.id);
    setDraftTitle(expense.title);
    setDraftAmount(expense.amount);
  }

  function cancelEditing() {
    setEditingExpenseId(null);
    setDraftTitle("");
    setDraftAmount("");
  }

  async function saveEdit(expense: Expense) {
    const payload: UpdateExpenseInput = {};

    if (draftTitle !== expense.title) {
      payload.title = draftTitle;
    }

    if (draftAmount !== expense.amount) {
      payload.amount = draftAmount;
    }

    if (Object.keys(payload).length === 0) {
      cancelEditing();
      return;
    }

    try {
      setIsSaving(true);
      await onEdit(expense.id, payload);
      cancelEditing();
    } finally {
      setIsSaving(false);
    }
  }

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
                {editingExpenseId === expense.id ? (
                  <form
                    className="expense-edit-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveEdit(expense);
                    }}
                  >
                    <input
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      placeholder="Title"
                    />
                    <input
                      value={draftAmount}
                      onChange={(event) => setDraftAmount(event.target.value)}
                      placeholder="Amount"
                      inputMode="decimal"
                    />
                    <div className="expense-actions">
                      <button type="submit" disabled={isSaving}>
                        Save
                      </button>
                      <button type="button" onClick={cancelEditing} disabled={isSaving}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <strong>{expense.title}</strong>
                    <p>{new Date(expense.created_at).toLocaleString()}</p>
                    <div className="expense-actions">
                      <button type="button" onClick={() => void onDelete(expense.id)}>
                        Delete
                      </button>
                      <button type="button" onClick={() => startEditing(expense)}>
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
              <span>${expense.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
