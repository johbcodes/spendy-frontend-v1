
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey?: string;
  yKeys?: { key: string; label: string; color: string }[];
  color?: string;
  stacked?: boolean;
}
export function BarChart({
  data,
  xKey,
  yKey,
  yKeys,
  color = '#093b40',
  stacked = false
}: BarChartProps) {
  return <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{
        fontSize: 12
      }} />
        <YAxis tick={{
        fontSize: 12
      }} />
        <Tooltip />
        {yKeys ? yKeys.map((series, index) => (
          <Bar key={index} dataKey={series.key} fill={series.color} name={series.label} stackId={stacked ? 'stack' : undefined} />
        )) : (
          yKey && <Bar dataKey={yKey} fill={color} />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>;
}
