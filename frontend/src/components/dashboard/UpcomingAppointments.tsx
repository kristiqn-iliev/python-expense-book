import { ChangeEvent, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function rangeCaption(range: AnalyticsRange) {
  if (range === "day") {
    return "Last 14 days";
  }

  if (range === "month") {
    return "Last 12 months";
  }

  return "Last 6 years";
}

export default function UpcomingAppointments({ expenses }: UpcomingAppointmentsProps) {
  const [range, setRange] = useState<AnalyticsRange>("month");

  const series = useMemo(() => buildSeries(expenses, range), [expenses, range]);
  const values = series.map((point) => point.amount);
  const maxValue = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  const activePoints = values.filter((value) => value > 0).length;
  const average = series.length > 0 ? total / series.length : 0;

  return (
    <section className="dashboard-card analytics-card">
      <div className="dashboard-card-header">
        <div>
          <h2>Analytics</h2>
          <p className="analytics-subtitle">{rangeCaption(range)}</p>
        </div>
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
            <span>Average period</span>
            <strong>{formatCurrency(average)}</strong>
          </article>
          <article>
            <span>Peak period</span>
            <strong>{formatCurrency(maxValue)}</strong>
          </article>
          <article>
            <span>Active periods</span>
            <strong>{activePoints}</strong>
          </article>
        </div>

        <div className="analytics-chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series} margin={{ top: 12, right: 16, left: -18, bottom: 8 }}>
              <defs>
                <linearGradient id="expenseAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#24c8ec" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#24c8ec" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(220, 228, 238, 0.9)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#95a0b1", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#95a0b1", fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrency(value)}
                width={78}
              />
              <Tooltip
                cursor={{ stroke: "rgba(36, 200, 236, 0.35)", strokeWidth: 1 }}
                contentStyle={{
                  border: "1px solid rgba(223, 231, 241, 0.95)",
                  borderRadius: "16px",
                  boxShadow: "0 14px 36px rgba(20, 30, 48, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                }}
                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Spend"]}
                labelStyle={{ color: "#2c3950", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#24c8ec"
                strokeWidth={3}
                fill="url(#expenseAreaFill)"
                activeDot={{ r: 5, strokeWidth: 0, fill: "#1598bf" }}
                dot={{ r: 2.5, strokeWidth: 0, fill: "#24c8ec" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-footer">
          {series.slice(-4).map((point) => (
            <div key={point.label} className="analytics-footer-item">
              <span>{point.label}</span>
              <strong>{point.amount > 0 ? formatCurrency(point.amount) : "No spend"}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
