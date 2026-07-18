import { useEffect, useState } from "react";
import EmployeeCard from "../components/EmployeeCard";
import { getEmployees } from "../services/firestoreService";
import API from "../services/api";
import "../styles/employee.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      // Firestore Employees
      const firestoreEmployees = await getEmployees();

      const companyEmployees = firestoreEmployees.map((emp) => ({
        ...emp,
        source: "company",
      }));

      // DummyJSON Employees
      const response = await API.get("/users");

      const apiEmployees = response.data.users.map((user) => ({
        id: `api-${user.id}`,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        department: user.company.department,
        designation: user.company.title,
        image: user.image,
        status: "Active",
        source: "api",
      }));

      // Merge both
      setEmployees([...companyEmployees, ...apiEmployees]);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    (employee.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <div className="employee-header">

        <h1>Employees</h1>

        <input
          type="text"
          placeholder="🔍 Search Employee..."
          className="search-box"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="employee-list">

        {filteredEmployees.length > 0 ? (

          filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
            />
          ))

        ) : (

          <h2>No Employees Found</h2>

        )}

      </div>

    </div>
  );
}

export default Employees;