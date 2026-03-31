import { notificationsData } from "../../data/mockData";

export default function NotificationsWidget() {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>Last Notifications</h2>
      </div>

      <div className="notifications-list">
        {notificationsData.map((notification) => (
          <article key={notification.id} className="notification-card">
            <div className="appointments-avatar">{notification.initials}</div>
            <div>
              <strong>{notification.name}</strong>
              <p>{notification.action}</p>
            </div>
            <span>{notification.time}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
