interface ActivityWidgetProps {
  percentage?: number;
}

export default function ActivityWidget({ percentage = 80 }: ActivityWidgetProps) {
  return (
    <section className="dashboard-card activity-card">
      <div className="dashboard-card-header">
        <h2>Activity</h2>
        <button type="button" className="dashboard-meta-button">
          Today
        </button>
      </div>

      <div className="activity-value">{percentage}%</div>
    </section>
  );
}
