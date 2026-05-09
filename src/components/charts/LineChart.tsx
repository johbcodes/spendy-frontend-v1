
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey?: string;
  yKeys?: { key: string; label: string; color: string }[];
  color?: string;
}
export function LineChart({
  data,
  xKey,
  yKey,
  yKeys,
  color = '#98e23f'
}: LineChartProps) {
  return <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{
        fontSize: 12
      }} />
        <YAxis tick={{
        fontSize: 12
      }} />
        <Tooltip />
        {yKeys ? yKeys.map((series, index) => (
          <Line key={index} type="monotone" dataKey={series.key} stroke={series.color} strokeWidth={2} name={series.label} />
        )) : (
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>;
}
