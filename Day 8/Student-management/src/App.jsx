import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const empty = {
  id: "",
  name: "",
  department: "IT",
  section: "A",
  attendance: "Present",
};

export default function App() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("students");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const addStudent = (e) => {
    e.preventDefault();
    if (!form.id || !form.name) return alert("Fill ID and Name");
    if (editIndex === -1) {
      if (students.some(s => s.id === form.id)) return alert("Duplicate ID");
      setStudents([...students, form]);
    } else {
      const arr = [...students];
      arr[editIndex] = form;
      setStudents(arr);
      setEditIndex(-1);
    }
    setForm(empty);
  };

  const editStudent = (i) => {
    setForm(students[i]);
    setEditIndex(i);
  };

  const deleteStudent = (i) => {
    if (window.confirm("Delete this student?")) {
      setStudents(students.filter((_, idx) => idx !== i));
    }
  };

  const filtered = useMemo(() => students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || s.id.includes(search)) &&
      (deptFilter === "All" || s.department === deptFilter) &&
      (sectionFilter === "All" || s.section === sectionFilter) &&
      (attendanceFilter === "All" || s.attendance === attendanceFilter)
    );
  }), [students, search, deptFilter, sectionFilter, attendanceFilter]);

  const present = students.filter(s => s.attendance === "Present").length;

  return (
    <div className="container">
      <h1>Student Management System</h1>

      <div className="stats">
        <div className="card"><h3>{students.length}</h3><p>Total</p></div>
        <div className="card green"><h3>{present}</h3><p>Present</p></div>
        <div className="card red"><h3>{students.length-present}</h3><p>Absent</p></div>
      </div>

      <form className="form" onSubmit={addStudent}>
        <input placeholder="Student ID" value={form.id}
          onChange={e=>setForm({...form,id:e.target.value})}/>
        <input placeholder="Student Name" value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})}/>

        <select value={form.department}
          onChange={e=>setForm({...form,department:e.target.value})}>
          <option>IT</option><option>CSE</option><option>ECE</option><option>EEE</option>
        </select>

        <select value={form.section}
          onChange={e=>setForm({...form,section:e.target.value})}>
          <option>A</option><option>B</option><option>C</option>
        </select>

        <select value={form.attendance}
          onChange={e=>setForm({...form,attendance:e.target.value})}>
          <option>Present</option><option>Absent</option>
        </select>

        <button>{editIndex===-1?"Add Student":"Update Student"}</button>
      </form>

      <div className="filters">
        <input placeholder="Search Name / ID" value={search}
          onChange={e=>setSearch(e.target.value)} />
        <select onChange={e=>setDeptFilter(e.target.value)}>
          <option>All</option><option>IT</option><option>CSE</option><option>ECE</option><option>EEE</option>
        </select>
        <select onChange={e=>setSectionFilter(e.target.value)}>
          <option>All</option><option>A</option><option>B</option><option>C</option>
        </select>
        <select onChange={e=>setAttendanceFilter(e.target.value)}>
          <option>All</option><option>Present</option><option>Absent</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Dept</th><th>Section</th><th>Attendance</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s,i)=>(
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.department}</td>
              <td>{s.section}</td>
              <td className={s.attendance==="Present"?"present":"absent"}>{s.attendance}</td>
              <td>
                <button onClick={()=>editStudent(i)}>Edit</button>
                <button onClick={()=>deleteStudent(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
