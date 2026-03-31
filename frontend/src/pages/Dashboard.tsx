import { useEffect, useState } from "react";

import { CreateExpenseInput, Expense, UpdateExpenseInput } from "../api/client";
import ActivityWidget from "../components/dashboard/ActivityWidget";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import Header from "../components/dashboard/Header";
import NotificationsWidget from "../components/dashboard/NotificationsWidget";
import ScheduleGrid from "../components/dashboard/ScheduleGrid";
import Sidebar from "../components/dashboard/Sidebar";
import StatisticCards from "../components/dashboard/StatisticCards";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import { dashboardApi } from "../services/api";

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadExpenses() {
    try {
      setError(null);
      setIsLoading(true);
      const data = await dashboardApi.listExpenses();
      setExpenses(data);
    } catch (requestError) {
      setError("Could not load expenses.");
      console.error(requestError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateExpense(payload: CreateExpenseInput) {
    try {
      setError(null);
      await dashboardApi.createExpense(payload);
      await loadExpenses();
    } catch (requestError) {
      setError("Could not save the expense.");
      console.error(requestError);
    }
  }

  async function handleUpdateExpense(expenseId: number, payload: UpdateExpenseInput) {
    try {
      setError(null);
      await dashboardApi.updateExpense(expenseId, payload);
      await loadExpenses();
    } catch (requestError) {
      setError("Could not update the expense.");
      console.error(requestError);
    }
  }

  async function handleDeleteExpense(expenseId: number) {
    try {
      setError(null);
      await dashboardApi.deleteExpense(expenseId);
      await loadExpenses();
    } catch (requestError) {
      setError("Could not delete the expense.");
      console.error(requestError);
    }
  }

  useEffect(() => {
    void loadExpenses();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      <div className="dashboard-layout">
        <Header searchValue={searchValue} onSearchChange={setSearchValue} />

        <main className="dashboard-main-area">
          {error ? <p className="dashboard-message dashboard-message--error">{error}</p> : null}
          {isLoading ? <p className="dashboard-message">Loading expenses...</p> : null}

          <div className="dashboard-grid">
            <section className="dashboard-primary-column">
              <StatisticCards />
              <ScheduleGrid onSubmitExpense={handleCreateExpense} />
              <UpcomingAppointments />
            </section>

            <aside className="dashboard-secondary-column">
              <CalendarWidget
                expenses={expenses}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={handleUpdateExpense}
              />
              <ActivityWidget />
              <NotificationsWidget />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
