import { FormEvent, useState } from "react";

import { CreateExpenseInput } from "../../api/client";

interface ScheduleGridProps {
  onSubmitExpense: (payload: CreateExpenseInput) => Promise<void>;
}

export default function ScheduleGrid({ onSubmitExpense }: ScheduleGridProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmitExpense({
        title,
        amount,
        purchase_date: purchaseDate,
        category,
        merchant: "",
        notes: "",
        is_recurring: isRecurring,
      });

      setTitle("");
      setAmount("");
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setCategory("");
      setIsRecurring(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>Add Expense</h2>
        <button type="button" className="dashboard-more-button" aria-label="More options">
          ...
        </button>
      </div>

      <form className="expense-form-card" onSubmit={handleSubmit}>
        <div className="expense-form-grid">
          <label>
            Title
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Coffee"
            />
          </label>

          <label>
            Amount
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="4.50"
            />
          </label>

          <label>
            Purchase date
            <input
              required
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
          </label>

          <label>
            Category
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Food"
            />
          </label>
        </div>

        <label className="expense-checkbox">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.target.checked)}
          />
          <span>Is recurring</span>
        </label>

        <button type="submit" className="expense-submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save expense"}
        </button>
      </form>
    </section>
  );
}
