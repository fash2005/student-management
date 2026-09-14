function Sidebar({ isOpen, activePage, setActivePage, onClose, onLogout }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'profile', label: 'My Profile', icon: '👤' },
    { key: 'courses', label: 'Course Registration', icon: '📚' }, 
    { key: 'lecturers', label: 'Lecturers', icon: '👨‍🏫' },
    { key: 'results', label: 'Check Results', icon: '📊' },
    { key: 'standing', label: 'Academic Standing', icon: '🎓' },
    { key: 'materials', label: 'Course Materials', icon: '📖' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 6L4 16l20 10 16-8v10h2V16L24 6z"
                fill="white"
              />
              <path
                d="M12 22.5V30c0 3.3 5.4 6 12 6s12-2.7 12-6v-7.5l-12 6-12-6z"
                fill="white"
                opacity="0.85"
              />
            </svg>
          </div>
          <div>
            <h2>Student Manager</h2>
            <p>University Portal</p>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={activePage === item.key ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item.key);
                onClose();
              }}
            >
              {item.icon} {item.label}
            </a>
          ))}

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
          >
            🚪 Logout
          </a>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;