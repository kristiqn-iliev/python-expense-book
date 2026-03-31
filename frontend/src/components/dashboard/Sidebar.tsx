interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-logo">
        <h1>Spender.</h1>
      </div>

      <nav className="dashboard-sidebar-nav">
        <button
          type="button"
          className="dashboard-sidebar-link dashboard-sidebar-link--active"
          onClick={onLogout}
        >
          <span className="dashboard-sidebar-icon dashboard-sidebar-icon--logout" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
