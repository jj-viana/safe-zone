'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface CrimeNatureBarChartSurfaceProps {
  data: ChartData[];
  colors: string[];
}

export default function CrimeNatureBarChartSurface({ data, colors }: CrimeNatureBarChartSurfaceProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 25, bottom: 50 }}
      >
        <XAxis type="number" stroke="#fff" hide />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#9CA3AF"
          width={80}
          tick={{ fontSize: 12, width: 170 }}
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
        <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]} barSize={30}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
