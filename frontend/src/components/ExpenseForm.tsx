import { FormEvent, useState } from "react";

import { CreateExpenseInput } from "../api/client";

interface ExpenseFormProps {
  onSubmit: (payload: CreateExpenseInput) => Promise<void>;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ title, amount });
      setTitle("");
      setAmount("");
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

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save expense"}
      </button>
    </form>
  );
}
