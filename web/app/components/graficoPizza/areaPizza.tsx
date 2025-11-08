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

interface GraficoAreaProps {
  data: ChartData[];
  colors: string[];
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

export default function AreaPizza({ data, colors = COLORS }: GraficoAreaProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #404040',
            borderRadius: '8px',
            color: '#F3F4F6',
          }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number | string, name: string) => [value, name]}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }}/>
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