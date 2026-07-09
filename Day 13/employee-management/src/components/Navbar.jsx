import { NavLink } from "react-router-dom";
import {
  FaUsers,
  FaHome,
  FaUserPlus,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <FaUsers />
        <span>EmployeePro</span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard">
            <FaHome />
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink to="/employees">
            <FaUsers />
            Employees
          </NavLink>
        </li>

        <li>
          <NavLink to="/add">
            <FaUserPlus />
            Add Employee
          </NavLink>
        </li>

        <li>
          <NavLink to="/about">
            <FaInfoCircle />
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;