'use client';

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

export interface ChartData {
  name: string;
  value: number;
  [key: string]: number | string;
}

interface PieChartSurfaceProps {
  data: ChartData[];
  colors: string[];
}

const DEFAULT_COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

export default function PieChartSurface({ data, colors = DEFAULT_COLORS }: PieChartSurfaceProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
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
          formatter={(value: number | string, name: string) => [value, name]}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="47%"
          outerRadius={65}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
