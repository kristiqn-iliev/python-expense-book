import { useMemo, useState } from "react";

import { Expense } from "../../api/client";

interface ActivityWidgetProps {
  expenses: Expense[];
}

function parseAmount(amount: string) {
  const value = Number.parseFloat(amount);
  return Number.isNaN(value) ? 0 : value;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function buildMonthlySeries(expenses: Expense[]) {
  const totals = new Map<string, number>();

  for (const expense of expenses) {
    const expenseDate = new Date(`${expense.purchase_date}T00:00:00`);
    const key = monthKey(expenseDate);
    totals.set(key, (totals.get(key) ?? 0) + parseAmount(expense.amount));
  }

  const latestDate =
    expenses.length > 0
      ? new Date(
          Math.max(
            ...expenses.map((expense) => new Date(`${expense.purchase_date}T00:00:00`).getTime()),
          ),
        )
      : new Date();

  const latestMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);

  return Array.from({ length: 18 }, (_, index) => {
    const current = addMonths(latestMonth, index - 17);
    const key = monthKey(current);

    return {
      key,
      label: current.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      amount: totals.get(key) ?? 0,
    };
  });
}

function calculateConfidence(values: number[]) {
  if (values.length < 2) {
    return { percent: 35, grade: "Low" };
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  if (average === 0) {
    return { percent: 20, grade: "Low" };
  }

  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  const variation = standardDeviation / average;
  const percent = Math.max(18, Math.min(94, Math.round((1 - variation) * 100)));

  if (percent >= 75) {
    return { percent, grade: "High" };
  }

  if (percent >= 50) {
    return { percent, grade: "Medium" };
  }

  return { percent, grade: "Low" };
}

export default function ActivityWidget({ expenses }: ActivityWidgetProps) {
  const [windowSize, setWindowSize] = useState(6);

  const monthlySeries = useMemo(() => buildMonthlySeries(expenses), [expenses]);
  const selectedSeries = monthlySeries.slice(-windowSize);
  const selectedValues = selectedSeries.map((point) => point.amount);
  const prediction =
    selectedValues.length > 0
      ? selectedValues.reduce((sum, value) => sum + value, 0) / selectedValues.length
      : 0;
  const confidence = calculateConfidence(selectedValues);
  const trendDelta =
    selectedValues.length >= 2
      ? selectedValues[selectedValues.length - 1] - selectedValues[0]
      : 0;

  return (
    <section className="dashboard-card activity-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Forecast</h2>
          <p className="activity-subtitle">Next month spending</p>
        </div>
        <span className="activity-window-tag">{windowSize} mo</span>
      </div>

      <div className="activity-forecast">
        <strong className="activity-forecast-value">{formatCurrency(prediction)}</strong>
        <p className="activity-forecast-copy">
          Based on the last {windowSize} months of spending history.
        </p>
      </div>

      <div className="activity-slider-block">
        <label htmlFor="forecast-window" className="activity-slider-label">
          Months used for prediction
        </label>
        <input
          id="forecast-window"
          className="activity-slider"
          type="range"
          min="3"
          max="18"
          step="1"
          value={windowSize}
          onChange={(event) => setWindowSize(Number(event.target.value))}
        />
        <div className="activity-slider-scale">
          <span>3</span>
          <span>18</span>
        </div>
      </div>

      <div className="activity-metrics">
        <article>
          <span>Confidence</span>
          <strong>{confidence.grade}</strong>
          <p>{confidence.percent}% stability score</p>
        </article>
        <article>
          <span>Trend</span>
          <strong>{trendDelta >= 0 ? "Rising" : "Cooling"}</strong>
          <p>{trendDelta === 0 ? "No major shift" : `${formatCurrency(Math.abs(trendDelta))} change`}</p>
        </article>
      </div>
    </section>
  );
}
