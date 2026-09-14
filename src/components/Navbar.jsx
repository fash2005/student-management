function Navbar({ onMenuClick, pageTitle }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <h2>{pageTitle}</h2>
      </div>

      <div className="student-info">
        👤 Student
      </div>
    </header>
  );
}

export default Navbar;