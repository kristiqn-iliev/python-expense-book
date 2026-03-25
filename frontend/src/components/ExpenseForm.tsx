import { FormEvent, useState } from "react";

import { CreateExpenseInput } from "../api/client";

interface ExpenseFormProps {
  onSubmit: (payload: CreateExpenseInput) => Promise<void>;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        amount,
        purchase_date: purchaseDate,
        category,
        merchant,
        notes,
        is_recurring: isRecurring,
      });
      setTitle("");
      setAmount("");
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setCategory("");
      setMerchant("");
      setNotes("");
      setIsRecurring(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Add expense</h2>
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

      <label>
        Merchant or vendor
        <input
          required
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
          placeholder="Cafe Central"
        />
      </label>

      <label>
        Notes
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional notes"
        />
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.target.checked)}
        />
        Is recurring
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save expense"}
      </button>
    </form>
  );
}
