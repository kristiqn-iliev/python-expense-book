interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ searchValue, onSearchChange }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-search">
        <span className="dashboard-search-icon" aria-hidden="true" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search something here..."
        />
      </div>

      <div className="dashboard-profile">
        <button type="button" className="dashboard-bell" aria-label="Notifications">
          <span className="dashboard-bell-dot" />
        </button>

        <div className="dashboard-user">
          <div className="dashboard-user-avatar">TL</div>
          <span>Thomas Lee</span>
        </div>
      </div>
    </header>
  );
}
