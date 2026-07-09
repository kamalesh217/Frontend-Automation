import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", employees: 20 },
  { month: "Feb", employees: 35 },
  { month: "Mar", employees: 45 },
  { month: "Apr", employees: 60 },
  { month: "May", employees: 80 },
  { month: "Jun", employees: 120 },
];

function EmployeeChart() {
  return (
    <div className="chart-card">
      <h2>Employee Growth</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="employees"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmployeeChart;