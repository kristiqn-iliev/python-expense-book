import { appointmentsData } from "../../data/mockData";

export default function UpcomingAppointments() {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>Upcoming Appointments</h2>
        <button type="button" className="dashboard-more-button" aria-label="More options">
          ...
        </button>
      </div>

      <div className="appointments-table">
        <div className="appointments-table-head">
          <span>Name</span>
          <span>Disease</span>
          <span>Date</span>
          <span>Time</span>
          <span />
        </div>

        {appointmentsData.map((appointment) => (
          <div key={appointment.id} className="appointments-table-row">
            <div className="appointments-person">
              <div className="appointments-avatar">{appointment.initials}</div>
              <span>{appointment.name}</span>
            </div>
            <span>{appointment.disease}</span>
            <span>{appointment.date}</span>
            <span>{appointment.time}</span>
            <button type="button" className="appointments-details-button">
              Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
