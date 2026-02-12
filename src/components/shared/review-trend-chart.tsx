'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyReviewStat } from '@/hooks/use-stats'

interface ReviewTrendChartProps {
  data: DailyReviewStat[]
}

export function ReviewTrendChart({ data }: ReviewTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="Reviews"
        />
        <Line
          type="monotone"
          dataKey="correctCount"
          stroke="hsl(142, 76%, 36%)"
          strokeWidth={2}
          dot={false}
          name="Correct"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
