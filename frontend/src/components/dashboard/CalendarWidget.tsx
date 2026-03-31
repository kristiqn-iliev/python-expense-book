import { CSSProperties, useState } from "react";

import { Expense, UpdateExpenseInput } from "../../api/client";

interface CalendarWidgetProps {
  expenses: Expense[];
  onDeleteExpense: (expenseId: number) => Promise<void>;
  onEditExpense: (expenseId: number, payload: UpdateExpenseInput) => Promise<void>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

interface ExpenseDraft {
  title: string;
  amount: string;
  purchase_date: string;
  category: string;
  merchant: string;
  notes: string;
  is_recurring: boolean;
}

interface CalendarDaySummary {
  date: Date;
  isoDate: string;
  day: number;
  isCurrentMonth: boolean;
  expenses: Expense[];
  totalAmount: number;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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

function parseAmount(amount: string) {
  const value = Number.parseFloat(amount);
  return Number.isNaN(value) ? 0 : value;
}

function formatCurrency(amount: number | string) {
  const value = typeof amount === "number" ? amount : parseAmount(amount);

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatLongDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

function buildCalendarDays(monthDate: Date, expenses: Expense[]): CalendarDaySummary[] {
  const expensesByDate = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const existing = expensesByDate.get(expense.purchase_date) ?? [];
    existing.push(expense);
    expensesByDate.set(expense.purchase_date, existing);
  }

  const firstOfMonth = startOfMonth(monthDate);
  const firstDayIndex = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstDayIndex);

  const calendarDays: CalendarDaySummary[] = [];

  for (let index = 0; index < 35; index += 1) {
    const currentDate = new Date(gridStart);
    currentDate.setDate(gridStart.getDate() + index);
    const isoDate = toIsoDate(currentDate);
    const dayExpenses = expensesByDate.get(isoDate) ?? [];

    calendarDays.push({
      date: currentDate,
      isoDate,
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === monthDate.getMonth(),
      expenses: dayExpenses,
      totalAmount: dayExpenses.reduce((sum, expense) => sum + parseAmount(expense.amount), 0),
    });
  }

  return calendarDays;
}

export default function CalendarWidget({
  expenses,
  onDeleteExpense,
  onEditExpense,
  isExpanded,
  onToggleExpanded,
}: CalendarWidgetProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  const calendarDays = buildCalendarDays(visibleMonth, expenses);
  const selectedDay =
    selectedDate ? calendarDays.find((day) => day.isoDate === selectedDate) ?? null : null;
  const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId) ?? null;
  const maxMonthTotal = calendarDays.reduce((highest, day) => {
    if (!day.isCurrentMonth) {
      return highest;
    }

    return day.totalAmount > highest ? day.totalAmount : highest;
  }, 0);

  async function handleDelete(expenseId: number) {
    try {
      setDeletingExpenseId(expenseId);
      await onDeleteExpense(expenseId);

      if (selectedExpenseId === expenseId) {
        setSelectedExpenseId(null);
        setDraft(null);
      }
    } finally {
      setDeletingExpenseId(null);
    }
  }

  async function saveEdit() {
    if (!selectedExpense || !draft) {
      return;
    }

    const payload: UpdateExpenseInput = {};

    if (draft.title !== selectedExpense.title) payload.title = draft.title;
    if (draft.amount !== selectedExpense.amount) payload.amount = draft.amount;
    if (draft.purchase_date !== selectedExpense.purchase_date) payload.purchase_date = draft.purchase_date;
    if (draft.category !== selectedExpense.category) payload.category = draft.category;
    if (draft.merchant !== selectedExpense.merchant) payload.merchant = draft.merchant;
    if (draft.notes !== selectedExpense.notes) payload.notes = draft.notes;
    if (draft.is_recurring !== selectedExpense.is_recurring) payload.is_recurring = draft.is_recurring;

    if (Object.keys(payload).length === 0) {
      setSelectedExpenseId(null);
      setDraft(null);
      return;
    }

    try {
      setIsSaving(true);
      await onEditExpense(selectedExpense.id, payload);
      setSelectedExpenseId(null);
      setDraft(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className={`dashboard-card calendar-card${isExpanded ? " calendar-card--expanded" : ""}`}>
        <div className="dashboard-card-header">
          <h2>
            {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <div className="calendar-nav-buttons">
            <button
              type="button"
              onClick={onToggleExpanded}
              aria-label={isExpanded ? "Shrink calendar" : "Expand calendar"}
              title={isExpanded ? "Shrink calendar" : "Expand calendar"}
            >
              {isExpanded ? "⤡" : "⤢"}
            </button>
            <button type="button" onClick={() => setVisibleMonth((current) => addMonths(current, -1))}>
              &lt;
            </button>
            <button type="button" onClick={() => setVisibleMonth((current) => addMonths(current, 1))}>
              &gt;
            </button>
          </div>
        </div>

        <div className="calendar-weekday-row">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className={`calendar-grid-widget${isExpanded ? " calendar-grid-widget--expanded" : ""}`}>
          {calendarDays.map((day) => {
            const hasExpense = day.totalAmount > 0;
            const intensity = maxMonthTotal > 0 ? day.totalAmount / maxMonthTotal : 0;

            return (
              <button
                key={day.isoDate}
                type="button"
                className={`calendar-grid-day${selectedDate === day.isoDate ? " calendar-grid-day--selected" : ""}${day.isCurrentMonth ? "" : " calendar-grid-day--outside"}${hasExpense ? " calendar-grid-day--filled" : ""}`}
                style={
                  {
                    "--calendar-day-tint": `${0.08 + intensity * 0.22}`,
                  } as CSSProperties
                }
                onClick={() => setSelectedDate(day.isoDate)}
              >
                <span className="calendar-grid-day-number">{day.day}</span>
                <span className="calendar-grid-day-content">
                  {hasExpense ? (
                    <strong>{formatCurrency(day.totalAmount)}</strong>
                  ) : (
                    <span className="calendar-grid-day-dot" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="calendar-forward-row">
          <button type="button" onClick={() => setVisibleMonth((current) => addMonths(current, 1))}>
            &gt;
          </button>
        </div>
      </section>

      {selectedDay ? (
        <div className="dashboard-modal-backdrop" onClick={() => setSelectedDate(null)}>
          <section className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <div className="dashboard-card-header">
              <div>
                <p className="dashboard-modal-label">Day overview</p>
                <h2>{formatLongDate(selectedDay.isoDate)}</h2>
              </div>
              <button type="button" className="dashboard-close-button" onClick={() => setSelectedDate(null)}>
                Close
              </button>
            </div>

            <div className="calendar-detail-stats">
              <article>
                <span>Total spent</span>
                <strong>{formatCurrency(selectedDay.totalAmount)}</strong>
              </article>
              <article>
                <span>Expenses</span>
                <strong>{selectedDay.expenses.length}</strong>
              </article>
            </div>

            {selectedDay.expenses.length > 0 ? (
              <div className="calendar-detail-list">
                {selectedDay.expenses.map((expense) => (
                  <article key={expense.id} className="calendar-detail-item">
                    <div className="calendar-detail-item-top">
                      <div>
                        <strong>{expense.title}</strong>
                        <p>{expense.category || "Uncategorized"}</p>
                      </div>
                      <span>{formatCurrency(expense.amount)}</span>
                    </div>

                    <div className="calendar-detail-meta">
                      {expense.merchant ? <p>Merchant: {expense.merchant}</p> : null}
                      {expense.notes ? <p>Notes: {expense.notes}</p> : null}
                      <p>Recurring: {expense.is_recurring ? "Yes" : "No"}</p>
                    </div>

                    <div className="calendar-detail-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExpenseId(expense.id);
                          setDraft(createDraft(expense));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="calendar-danger-button"
                        onClick={() => void handleDelete(expense.id)}
                        disabled={deletingExpenseId === expense.id}
                      >
                        {deletingExpenseId === expense.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="calendar-empty-state">
                <strong>No expenses for this day</strong>
                <p>This part is wired, so any newly added expense for this date will appear here.</p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {selectedExpense && draft ? (
        <div className="dashboard-modal-backdrop" onClick={() => {
          setSelectedExpenseId(null);
          setDraft(null);
        }}>
          <section className="dashboard-modal dashboard-modal--small" onClick={(event) => event.stopPropagation()}>
            <div className="dashboard-card-header">
              <div>
                <p className="dashboard-modal-label">Edit expense</p>
                <h2>{selectedExpense.title}</h2>
              </div>
              <button
                type="button"
                className="dashboard-close-button"
                onClick={() => {
                  setSelectedExpenseId(null);
                  setDraft(null);
                }}
              >
                Close
              </button>
            </div>

            <form
              className="expense-form-card expense-form-card--modal"
              onSubmit={(event) => {
                event.preventDefault();
                void saveEdit();
              }}
            >
              <div className="expense-form-grid">
                <label>
                  Title
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, title: event.target.value } : current))
                    }
                  />
                </label>

                <label>
                  Amount
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, amount: event.target.value } : current))
                    }
                  />
                </label>

                <label>
                  Purchase date
                  <input
                    type="date"
                    value={draft.purchase_date}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, purchase_date: event.target.value } : current,
                      )
                    }
                  />
                </label>

                <label>
                  Category
                  <input
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, category: event.target.value } : current))
                    }
                  />
                </label>

                <label>
                  Merchant
                  <input
                    value={draft.merchant}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, merchant: event.target.value } : current))
                    }
                  />
                </label>

                <label className="expense-form-grid__full">
                  Notes
                  <textarea
                    rows={3}
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft((current) => (current ? { ...current, notes: event.target.value } : current))
                    }
                  />
                </label>
              </div>

              <label className="expense-checkbox">
                <input
                  type="checkbox"
                  checked={draft.is_recurring}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, is_recurring: event.target.checked } : current,
                    )
                  }
                />
                <span>Is recurring</span>
              </label>

              <button type="submit" className="expense-submit-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
