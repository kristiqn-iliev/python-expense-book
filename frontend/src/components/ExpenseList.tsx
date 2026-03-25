import { useState } from "react";

import { Expense, UpdateExpenseInput } from "../api/client";

interface ExpenseDraft {
  title: string;
  amount: string;
  purchase_date: string;
  category: string;
  merchant: string;
  notes: string;
  is_recurring: boolean;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (expenseId: number) => Promise<void>;
  onEdit: (expenseId: number, payload: UpdateExpenseInput) => Promise<void>;
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function formatPurchaseDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString();
  }

  function startEditing(expense: Expense) {
    setEditingExpenseId(expense.id);
    setDraft({
      title: expense.title,
      amount: expense.amount,
      purchase_date: expense.purchase_date,
      category: expense.category,
      merchant: expense.merchant,
      notes: expense.notes,
      is_recurring: expense.is_recurring,
    });
  }

  function cancelEditing() {
    setEditingExpenseId(null);
    setDraft(null);
  }

  async function saveEdit(expense: Expense) {
    if (!draft) {
      return;
    }

    const payload: UpdateExpenseInput = {};

    if (draft.title !== expense.title) {
      payload.title = draft.title;
    }

    if (draft.amount !== expense.amount) {
      payload.amount = draft.amount;
    }

    if (draft.purchase_date !== expense.purchase_date) {
      payload.purchase_date = draft.purchase_date;
    }

    if (draft.category !== expense.category) {
      payload.category = draft.category;
    }

    if (draft.merchant !== expense.merchant) {
      payload.merchant = draft.merchant;
    }

    if (draft.notes !== expense.notes) {
      payload.notes = draft.notes;
    }

    if (draft.is_recurring !== expense.is_recurring) {
      payload.is_recurring = draft.is_recurring;
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
                      value={draft?.title ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, title: event.target.value }
                            : currentDraft,
                        )
                      }
                      placeholder="Title"
                    />
                    <input
                      value={draft?.amount ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, amount: event.target.value }
                            : currentDraft,
                        )
                      }
                      placeholder="Amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                    />
                    <input
                      value={draft?.purchase_date ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, purchase_date: event.target.value }
                            : currentDraft,
                        )
                      }
                      type="date"
                    />
                    <input
                      value={draft?.category ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, category: event.target.value }
                            : currentDraft,
                        )
                      }
                      placeholder="Category"
                    />
                    <input
                      value={draft?.merchant ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, merchant: event.target.value }
                            : currentDraft,
                        )
                      }
                      placeholder="Merchant or vendor"
                    />
                    <textarea
                      rows={3}
                      value={draft?.notes ?? ""}
                      onChange={(event) =>
                        setDraft((currentDraft) =>
                          currentDraft
                            ? { ...currentDraft, notes: event.target.value }
                            : currentDraft,
                        )
                      }
                      placeholder="Notes"
                    />
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={draft?.is_recurring ?? false}
                        onChange={(event) =>
                          setDraft((currentDraft) =>
                            currentDraft
                              ? { ...currentDraft, is_recurring: event.target.checked }
                              : currentDraft,
                          )
                        }
                      />
                      Is recurring
                    </label>
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
                    <p>Purchase date: {formatPurchaseDate(expense.purchase_date)}</p>
                    <p>Added: {new Date(expense.created_at).toLocaleString()}</p>
                    <p>Category: {expense.category}</p>
                    <p>Merchant: {expense.merchant}</p>
                    <p>Recurring: {expense.is_recurring ? "Yes" : "No"}</p>
                    {expense.notes ? <p>Notes: {expense.notes}</p> : null}
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
