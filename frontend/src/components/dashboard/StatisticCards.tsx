import { statisticsData } from "../../data/mockData";

export default function StatisticCards() {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>Statistic</h2>
        <button type="button" className="dashboard-more-button" aria-label="More options">
          ...
        </button>
      </div>

      <div className="stats-grid">
        {statisticsData.map((stat) => (
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
