'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface GraficoAreaProps {
  data: ChartData[];
  colors: string[];
}

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444'];

export default function AreaGrafico({ data, colors = COLORS }: GraficoAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={120}
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #404040',
            borderRadius: '8px',
            color: '#F3F4F6',
          }}
          labelStyle={{ color: '#F3F4F6' }}
          formatter={(value) => [value, 'Ocorrências']}
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

