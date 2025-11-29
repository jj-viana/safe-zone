'use client';

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartSurfaceProps {
  data: ChartData[];
  colors: string[];
}

const DEFAULT_COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

export default function BarChartSurface({ data, colors = DEFAULT_COLORS }: BarChartSurfaceProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 5, bottom: 0 }}
      >
        <XAxis
          dataKey="name"
          height={12}
          stroke="#9CA3AF"
          tick={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #404040',
            borderRadius: '8px',
            color: '#F3F4F6',
            fontSize: '12px',
            padding: '5px',
          }}
          itemStyle={{ color: '#fff', padding: 0, margin: 0 }}
          formatter={value => [value, 'Ocorrências']}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
