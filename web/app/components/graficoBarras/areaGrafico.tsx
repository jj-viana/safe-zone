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

const COLORS = ['#EC4899', '#F97316', '#06B6D4', '#FBBF24', '#EF4444', '#22C55E', '#8B5CF6'];

export default function AreaGrafico({ data, colors = COLORS }: GraficoAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 5, bottom:0 }}
      >
        <XAxis
          dataKey="name"
          angle={0}
          height={45}
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
            itemStyle={{ color: '#fff' }}
            
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

