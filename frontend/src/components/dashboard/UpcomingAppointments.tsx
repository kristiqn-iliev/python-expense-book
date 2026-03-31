import { ChangeEvent, useMemo, useState } from "react";

import { Expense } from "../../api/client";

type AnalyticsRange = "day" | "month" | "year";

interface UpcomingAppointmentsProps {
  expenses: Expense[];
}

interface DataPoint {
  label: string;
  amount: number;
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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function addDays(date: Date, offset: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function addYears(date: Date, offset: number) {
  return new Date(date.getFullYear() + offset, 0, 1);
}

function dateKey(date: Date, range: AnalyticsRange) {
  if (range === "year") {
    return `${date.getFullYear()}`;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");

  if (range === "month") {
    return `${date.getFullYear()}-${month}`;
  }

  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildSeries(expenses: Expense[], range: AnalyticsRange): DataPoint[] {
  const sourceDate =
    expenses.length > 0
      ? new Date(
          Math.max(
            ...expenses.map((expense) => new Date(`${expense.purchase_date}T00:00:00`).getTime()),
          ),
        )
      : new Date();

  const buckets = new Map<string, number>();

  for (const expense of expenses) {
    const expenseDate = new Date(`${expense.purchase_date}T00:00:00`);
    const key =
      range === "day"
        ? dateKey(startOfDay(expenseDate), "day")
        : range === "month"
          ? dateKey(startOfMonth(expenseDate), "month")
          : dateKey(startOfYear(expenseDate), "year");

    buckets.set(key, (buckets.get(key) ?? 0) + parseAmount(expense.amount));
  }

  if (range === "day") {
    const end = startOfDay(sourceDate);

    return Array.from({ length: 14 }, (_, index) => {
      const current = addDays(end, index - 13);
      const key = dateKey(current, "day");
      return {
        label: current.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        amount: buckets.get(key) ?? 0,
      };
    });
  }

  if (range === "month") {
    const end = startOfMonth(sourceDate);

    return Array.from({ length: 12 }, (_, index) => {
      const current = addMonths(end, index - 11);
      const key = dateKey(current, "month");
      return {
        label: current.toLocaleDateString(undefined, { month: "short" }),
        amount: buckets.get(key) ?? 0,
      };
    });
  }

  const end = startOfYear(sourceDate);

  return Array.from({ length: 6 }, (_, index) => {
    const current = addYears(end, index - 5);
    const key = dateKey(current, "year");
    return {
      label: `${current.getFullYear()}`,
      amount: buckets.get(key) ?? 0,
    };
  });
}

function buildPath(points: number[], width: number, height: number) {
  if (points.length === 0) {
    return "";
  }

  const max = Math.max(...points, 1);
  const stepX = points.length > 1 ? width / (points.length - 1) : width;

  return points
    .map((amount, index) => {
      const x = index * stepX;
      const y = height - (amount / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function UpcomingAppointments({ expenses }: UpcomingAppointmentsProps) {
  const [range, setRange] = useState<AnalyticsRange>("month");

  const series = useMemo(() => buildSeries(expenses, range), [expenses, range]);
  const values = series.map((point) => point.amount);
  const maxValue = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  const activePoints = values.filter((value) => value > 0).length;
  const path = buildPath(values, 100, 52);

  return (
    <section className="dashboard-card analytics-card">
      <div className="dashboard-card-header">
        <h2>Analytics</h2>
        <select
          className="analytics-select"
          value={range}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setRange(event.target.value as AnalyticsRange)
          }
          aria-label="Select analytics time period"
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="analytics-panel">
        <div className="analytics-summary">
          <article>
            <span>Total spend</span>
            <strong>{formatCurrency(total)}</strong>
          </article>
          <article>
            <span>Peak</span>
            <strong>{formatCurrency(maxValue)}</strong>
          </article>
          <article>
            <span>Active periods</span>
            <strong>{activePoints}</strong>
          </article>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-scale">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency(maxValue / 2)}</span>
            <span>{formatCurrency(0)}</span>
          </div>

          <div className="analytics-chart">
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={`M 0 60 ${path} L 100 60 Z`}
                className="analytics-area-path"
              />
              <path d={path} className="analytics-line-path" />
              {values.map((amount, index) => {
                const x = values.length > 1 ? (index / (values.length - 1)) * 100 : 50;
                const y = 52 - (amount / maxValue) * 52;

                return (
                  <circle
                    key={`${series[index].label}-${index}`}
                    cx={x}
                    cy={Number.isFinite(y) ? y : 52}
                    r={amount > 0 ? 1.6 : 1.1}
                    className={amount > 0 ? "analytics-point analytics-point--active" : "analytics-point"}
                  />
                );
              })}
            </svg>
          </div>

          <div className="analytics-labels">
            {series.map((point) => (
              <div key={point.label} className="analytics-label-item">
                <strong>{point.amount > 0 ? formatCurrency(point.amount) : "·"}</strong>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
