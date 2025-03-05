import type React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface AreaChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: any) => string
  showLegend?: boolean
  showGridLines?: boolean
  startEndOnly?: boolean
  className?: string
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = false,
  showGridLines = true,
  startEndOnly = false,
  className = "text-white",
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={showGridLines ? "var(--border)" : "none"} />
        <XAxis
          dataKey={index}
          stroke="var(--muted-foreground)"
          tick={{ fill: "var(--muted-foreground)" }}
          tickLine={{ stroke: "var(--muted-foreground)" }}
          
        />
        <YAxis
          tickFormatter={valueFormatter}
          stroke="var(--muted-foreground)"
          tick={{ fill: "var(--muted-foreground)" }}
          tickLine={{ stroke: "var(--muted-foreground)" }}
        />
        <Tooltip
          formatter={valueFormatter ? (value) => [valueFormatter(value)] : undefined}
          contentStyle={{
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
          }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={`hsl(var(--${colors[i % colors.length]}))`}
            fill={`hsl(var(--${colors[i % colors.length]}))`}
            fillOpacity={0.3}
            activeDot={{ r: 6, strokeWidth: 0, fill: `hsl(var(--${colors[i % colors.length]}))` }}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: any) => string
  showLegend?: boolean
  layout?: "horizontal" | "vertical"
  className?: string
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = false,
  layout = "horizontal",
  className = "",
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        {layout === "horizontal" ? (
          <>
            <XAxis
              dataKey={index}
              stroke="var(--muted-foreground)"
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--muted-foreground)" }}
            />
            <YAxis
              tickFormatter={valueFormatter}
              stroke="var(--muted-foreground)"
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--muted-foreground)" }}
            />
          </>
        ) : (
          <>
            <YAxis
              dataKey={index}
              stroke="var(--muted-foreground)"
              type="category"
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--muted-foreground)" }}
            />
            <XAxis
              tickFormatter={valueFormatter}
              stroke="var(--muted-foreground)"
              tick={{ fill: "var(--muted-foreground)" }}
              tickLine={{ stroke: "var(--muted-foreground)" }}
            />
          </>
        )}
        <Tooltip
          formatter={valueFormatter ? (value) => [valueFormatter(value)] : undefined}
          contentStyle={{
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
          }}
          labelStyle={{ color: "var(--card-foreground)" }}
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={`hsl(var(--${colors[i % colors.length]}))`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

