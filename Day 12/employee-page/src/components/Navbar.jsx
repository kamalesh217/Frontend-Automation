import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Employee Manager</h2>

      <div className="links">
        <Link to="/">Dashboard</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/add">Add Employee</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
}

export default Navbar;