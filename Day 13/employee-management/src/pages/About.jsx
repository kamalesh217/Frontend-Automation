import {
  FaUsers,
  FaDatabase,
  FaLock,
  FaChartLine,
  FaCloud,
  FaCode,
} from "react-icons/fa";

import "../styles/about.css";

function About() {
  return (
    <div className="about-page">

      <div className="about-header">
        <h1>About EmployeePro</h1>
        <p>
          EmployeePro is a modern Human Resource Management System (HRMS)
          developed to simplify employee management through a secure,
          user-friendly, and responsive web application.
        </p>
      </div>

      <div className="about-grid">

        <div className="about-card">
          <FaUsers className="about-icon" />
          <h3>Employee Management</h3>
          <p>
            Add, edit, delete, search and manage employee records with
            real-time Firestore database integration.
          </p>
        </div>

        <div className="about-card">
          <FaLock className="about-icon" />
          <h3>Secure Authentication</h3>
          <p>
            Firebase Authentication provides secure Email/Password login,
            Google Sign-In, Forgot Password, and Protected Routes.
          </p>
        </div>

        <div className="about-card">
          <FaDatabase className="about-icon" />
          <h3>Cloud Database</h3>
          <p>
            Employee information is securely stored and synchronized using
            Firebase Firestore.
          </p>
        </div>

        <div className="about-card">
          <FaChartLine className="about-icon" />
          <h3>Dashboard Analytics</h3>
          <p>
            Interactive charts and statistics provide quick insights into
            employee data and organizational growth.
          </p>
        </div>

        <div className="about-card">
          <FaCloud className="about-icon" />
          <h3>API Integration</h3>
          <p>
            Integrated with DummyJSON REST API to display demo employee
            records alongside company employees stored in Firestore.
          </p>
        </div>

        <div className="about-card">
          <FaCode className="about-icon" />
          <h3>Technology Stack</h3>
          <p>
            React.js, React Router, Firebase Authentication,
            Firestore, Axios, React Icons, Recharts, and CSS.
          </p>
        </div>

      </div>

      <div className="project-info">

        <h2>Project Highlights</h2>

        <ul>
          <li>✔ Secure Login & Registration</li>
          <li>✔ Google Authentication</li>
          <li>✔ Forgot Password</li>
          <li>✔ Employee CRUD Operations</li>
          <li>✔ Firestore Database Integration</li>
          <li>✔ REST API Integration</li>
          <li>✔ Dashboard Analytics</li>
          <li>✔ Responsive User Interface</li>
        </ul>

      </div>

    </div>
  );
}

export default About;