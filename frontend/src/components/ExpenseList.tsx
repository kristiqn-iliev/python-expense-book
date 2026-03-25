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

interface CalendarDay {
  date: Date;
  isoDate: string;
  isCurrentMonth: boolean;
  expenses: Expense[];
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(day: Date) {
  return new Date(day.getFullYear(), day.getMonth(), 1);
}

function addMonths(day: Date, offset: number) {
  return new Date(day.getFullYear(), day.getMonth() + offset, 1);
}

function toIsoDate(day: Date) {
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function buildCalendarDays(monthDate: Date, expenses: Expense[]): CalendarDay[] {
  const expensesByDate = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const current = expensesByDate.get(expense.purchase_date) ?? [];
    current.push(expense);
    expensesByDate.set(expense.purchase_date, current);
  }

  const firstOfMonth = startOfMonth(monthDate);
  const firstDayIndex = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstDayIndex);

  const calendarDays: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    const isoDate = toIsoDate(current);

    calendarDays.push({
      date: current,
      isoDate,
      isCurrentMonth: current.getMonth() === monthDate.getMonth(),
      expenses: expensesByDate.get(isoDate) ?? [],
    });
  }

  return calendarDays;
}

function formatMonthLabel(day: Date) {
  return day.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: string) {
  return `EUR ${amount}`;
}

function formatPurchaseDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

function createDraft(expense: Expense): ExpenseDraft {
  return {
    title: expense.title,
    amount: expense.amount,
    purchase_date: expense.purchase_date,
    category: expense.category,
    merchant: expense.merchant,
    notes: expense.notes,
    is_recurring: expense.is_recurring,
  };
}

export function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const isEditingSelected = draft !== null && selectedExpense !== null;
  const calendarDays = buildCalendarDays(visibleMonth, expenses);

  function openExpense(expense: Expense) {
    setSelectedExpenseId(expense.id);
    setDraft(null);
  }

  function openDay(calendarDay: CalendarDay) {
    setSelectedDay(calendarDay);
  }

  function closeDayDetail() {
    setSelectedDay(null);
  }

  function closeExpenseDetail() {
    setSelectedExpenseId(null);
    setDraft(null);
  }

  function startEditing(expense: Expense) {
    setDraft(createDraft(expense));
  }

  function cancelEditing() {
    setDraft(null);
  }

  async function handleDeleteSelected() {
    if (!selectedExpense) {
      return;
    }

    await onDelete(selectedExpense.id);
    closeExpenseDetail();
  }

  async function saveEdit() {
    if (!selectedExpense || !draft) {
      return;
    }

    const payload: UpdateExpenseInput = {};

    if (draft.title !== selectedExpense.title) {
      payload.title = draft.title;
    }

    if (draft.amount !== selectedExpense.amount) {
      payload.amount = draft.amount;
    }

    if (draft.purchase_date !== selectedExpense.purchase_date) {
      payload.purchase_date = draft.purchase_date;
    }

    if (draft.category !== selectedExpense.category) {
      payload.category = draft.category;
    }

    if (draft.merchant !== selectedExpense.merchant) {
      payload.merchant = draft.merchant;
    }

    if (draft.notes !== selectedExpense.notes) {
      payload.notes = draft.notes;
    }

    if (draft.is_recurring !== selectedExpense.is_recurring) {
      payload.is_recurring = draft.is_recurring;
    }

    if (Object.keys(payload).length === 0) {
      cancelEditing();
      return;
    }

    try {
      setIsSaving(true);
      await onEdit(selectedExpense.id, payload);
      setDraft(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="panel calendar-panel">
        <div className="section-header calendar-toolbar">
          <div>
            <h2>Expense calendar</h2>
            <span>{expenses.length} items</span>
          </div>
          <div className="calendar-nav">
            <button
              type="button"
              onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
            >
              Previous
            </button>
            <strong>{formatMonthLabel(visibleMonth)}</strong>
            <button
              type="button"
              onClick={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
            >
              Next
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="calendar-weekday">
              {label}
            </div>
          ))}

          {calendarDays.map((calendarDay) => (
            <article
              key={calendarDay.isoDate}
              className={`calendar-day${calendarDay.isCurrentMonth ? "" : " calendar-day--outside"}`}
            >
              <header className="calendar-day-header">
                <span>{calendarDay.date.getDate()}</span>
                <small>{calendarDay.expenses.length ? `${calendarDay.expenses.length} items` : ""}</small>
              </header>

              <div className="calendar-cell-expenses">
                {calendarDay.expenses.length === 0 ? (
                  <p className="calendar-empty">No expenses</p>
                ) : (
                  calendarDay.expenses.slice(0, 3).map((expense) => (
                    <button
                      key={expense.id}
                      type="button"
                      className="calendar-expense-pill"
                      onClick={() => openExpense(expense)}
                    >
                      <span>{expense.title}</span>
                      <strong>{formatCurrency(expense.amount)}</strong>
                    </button>
                  ))
                )}

                {calendarDay.expenses.length > 3 ? (
                  <button
                    type="button"
                    className="calendar-more-button"
                    onClick={() => openDay(calendarDay)}
                  >
                    Show {calendarDay.expenses.length - 3} more
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedDay ? (
        <div className="expense-detail-backdrop day-detail-backdrop" onClick={closeDayDetail}>
          <section
            className="expense-detail day-detail"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-header detail-header">
              <div>
                <p className="eyebrow">Day overview</p>
                <h2>{formatPurchaseDate(selectedDay.isoDate)}</h2>
              </div>
              <button type="button" className="detail-close" onClick={closeDayDetail}>
                Close
              </button>
            </div>

            <div className="day-detail-list">
              {selectedDay.expenses.map((expense) => (
                <button
                  key={expense.id}
                  type="button"
                  className="day-detail-item"
                  onClick={() => openExpense(expense)}
                >
                  <div>
                    <strong>{expense.title}</strong>
                    <p>{expense.category}</p>
                    <p>{expense.merchant}</p>
                  </div>
                  <span>{formatCurrency(expense.amount)}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {selectedExpense ? (
        <div className="expense-detail-backdrop" onClick={closeExpenseDetail}>
          <section
            className="expense-detail"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-header detail-header">
              <div>
                <p className="eyebrow">Expense details</p>
                <h2>{selectedExpense.title}</h2>
              </div>
              <button type="button" className="detail-close" onClick={closeExpenseDetail}>
                Close
              </button>
            </div>

            {isEditingSelected ? (
              <form
                className="expense-edit-form detail-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveEdit();
                }}
              >
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft ? { ...currentDraft, title: event.target.value } : currentDraft,
                    )
                  }
                  placeholder="Title"
                />
                <input
                  value={draft.amount}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft ? { ...currentDraft, amount: event.target.value } : currentDraft,
                    )
                  }
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                />
                <input
                  value={draft.purchase_date}
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
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft ? { ...currentDraft, category: event.target.value } : currentDraft,
                    )
                  }
                  placeholder="Category"
                />
                <input
                  value={draft.merchant}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft ? { ...currentDraft, merchant: event.target.value } : currentDraft,
                    )
                  }
                  placeholder="Merchant"
                />
                <textarea
                  rows={4}
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((currentDraft) =>
                      currentDraft ? { ...currentDraft, notes: event.target.value } : currentDraft,
                    )
                  }
                  placeholder="Notes"
                />
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={draft.is_recurring}
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
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                  <button type="button" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="detail-headline">
                  <strong>{selectedExpense.title}</strong>
                  <span>{formatCurrency(selectedExpense.amount)}</span>
                </div>
                <div className="detail-meta">
                  <p>Purchase date: {formatPurchaseDate(selectedExpense.purchase_date)}</p>
                  <p>Added: {new Date(selectedExpense.created_at).toLocaleString()}</p>
                  <p>Category: {selectedExpense.category}</p>
                  <p>Merchant: {selectedExpense.merchant}</p>
                  <p>Recurring: {selectedExpense.is_recurring ? "Yes" : "No"}</p>
                  {selectedExpense.notes ? <p>Notes: {selectedExpense.notes}</p> : null}
                </div>
                <div className="expense-actions">
                  <button type="button" onClick={() => void handleDeleteSelected()}>
                    Delete
                  </button>
                  <button type="button" onClick={() => startEditing(selectedExpense)}>
                    Edit
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
