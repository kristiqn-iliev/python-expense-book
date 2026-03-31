import { navigationItems } from "../../data/mockData";

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

export default function Sidebar({
  activeItem = "dashboard",
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-logo">
        <h1>TheraDash.</h1>
      </div>

      <nav className="dashboard-sidebar-nav">
        {navigationItems.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`dashboard-sidebar-link${isActive ? " dashboard-sidebar-link--active" : ""}`}
              onClick={() => onNavigate?.(item.id)}
            >
              <span className="dashboard-sidebar-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
