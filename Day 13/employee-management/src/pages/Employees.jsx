import { useEffect, useState } from "react";
import API from "../services/api";
import EmployeeCard from "../components/EmployeeCard";
import "../styles/employee.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/users");
      setEmployees(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <div className="employee-header">
        <h1>Employees</h1>

        <input
          type="text"
          placeholder="🔍 Search employee..."
          className="search-box"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="employee-list">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>

    </div>
  );
}

export default Employees;