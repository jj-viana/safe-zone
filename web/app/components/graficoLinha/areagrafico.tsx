'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ChartData {
  name: string; 
  [key: string]: string | number;
}

interface AreaGraficoLinhaProps {
  data: ChartData[];
  colors: string[];
  crimeTypes: string[];
}

export default function AreaGraficoLinha({ data, colors, crimeTypes }: AreaGraficoLinhaProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart  
        data={data}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="name" stroke="#fff" style={{ fontSize: '13px' }} />
        <YAxis stroke="#fff" style={{ fontSize: '16px' }}/>
        <Tooltip 
          contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#F3F4F6',
            }} 
        />
        <Legend wrapperStyle={{ color: '#fff'}}/>
        {crimeTypes.map((crimeName, index) => (
          <Line 
            key={crimeName}
            type="monotone"
            dataKey={crimeName}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
