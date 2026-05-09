
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
interface DonutChartProps {
  data: Array<Record<string, unknown>>;
  nameKey: string;
  valueKey: string;
  colors?: string[];
}
const DEFAULT_COLORS = ['#98e23f', '#093b40', '#1a1a1a', '#f2f2f2', '#60a5fa'];
export function DonutChart({
  data,
  nameKey,
  valueKey,
  colors = DEFAULT_COLORS
}: DonutChartProps) {
  return <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey={valueKey} nameKey={nameKey}>
          {data.map((_entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>;
}