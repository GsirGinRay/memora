'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { CardDistribution } from '@/hooks/use-stats'

interface CardDistributionChartProps {
  data: CardDistribution[]
}

const STATE_COLORS: Record<string, string> = {
  new: '#3b82f6',
  learning: '#f59e0b',
  review: '#22c55e',
  relearning: '#ef4444',
}

const STATE_LABELS: Record<string, string> = {
  new: 'New',
  learning: 'Learning',
  review: 'Review',
  relearning: 'Relearning',
}

export function CardDistributionChart({ data }: CardDistributionChartProps) {
  const chartData = data.map((d) => ({
    name: STATE_LABELS[d.state] ?? d.state,
    value: d.count,
    fill: STATE_COLORS[d.state] ?? '#6b7280',
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
