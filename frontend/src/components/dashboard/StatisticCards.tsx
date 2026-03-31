import { Expense } from "../../api/client";

interface StatisticCardsProps {
  expenses: Expense[];
}

interface KpiCard {
  id: string;
  label: string;
  value: string;
  icon: "users" | "reports" | "consultations" | "experience";
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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export default function StatisticCards({ expenses }: StatisticCardsProps) {
  const now = new Date();
  const currentMonth = monthKey(now);
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const daysElapsed = Math.max(now.getDate(), 1);

  const categoryTotals = new Map<string, number>();
  const monthlyTotals = new Map<string, number>();

  let totalSpendThisMonth = 0;

  for (const expense of expenses) {
    const amount = parseAmount(expense.amount);
    const expenseDate = new Date(`${expense.purchase_date}T00:00:00`);
    const expenseMonth = monthKey(expenseDate);
    const categoryName = expense.category?.trim() || "Uncategorized";

    monthlyTotals.set(expenseMonth, (monthlyTotals.get(expenseMonth) ?? 0) + amount);
    categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + amount);

    if (
      expenseDate.getFullYear() === currentYear &&
      expenseDate.getMonth() === currentMonthIndex
    ) {
      totalSpendThisMonth += amount;
    }
  }

  const averageDailySpend = totalSpendThisMonth / daysElapsed;

  const forecastBase = Array.from(monthlyTotals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-3)
    .map(([, amount]) => amount);
  const forecastNextMonth =
    forecastBase.length > 0
      ? forecastBase.reduce((sum, value) => sum + value, 0) / forecastBase.length
      : 0;

  const highestCategoryEntry =
    Array.from(categoryTotals.entries()).sort((left, right) => right[1] - left[1])[0] ?? null;

  const cards: KpiCard[] = [
    {
      id: "total-spend-month",
      label: "Total spend this month",
      value: formatCurrency(totalSpendThisMonth),
      icon: "users",
    },
    {
      id: "avg-daily-spend",
      label: "Avg daily spend",
      value: formatCurrency(averageDailySpend),
      icon: "reports",
    },
    {
      id: "forecast-next-month",
      label: "Forecast next month",
      value: formatCurrency(forecastNextMonth),
      icon: "consultations",
    },
    {
      id: "highest-category",
      label: "Highest spend category",
      value: highestCategoryEntry ? highestCategoryEntry[0] : "No data",
      icon: "experience",
    },
  ];

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>Financial KPI</h2>
        <button type="button" className="dashboard-more-button" aria-label="More options">
          ...
        </button>
      </div>

      <div className="stats-grid">
        {cards.map((stat) => (
          <article key={stat.id} className="stat-card">
            <div className={`stat-card-icon stat-card-icon--${stat.icon}`} aria-hidden="true" />
            <div>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
