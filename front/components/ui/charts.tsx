"use client"

import { AreaChart as TremorAreaChart } from "@tremor/react"
import { BarChart as TremorBarChart } from "@tremor/react"
import { LineChart as TremorLineChart } from "@tremor/react"

export function AreaChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  className,
}: {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showGridLines?: boolean
  startEndOnly?: boolean
  className?: string
}) {
  return (
    <TremorAreaChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      className={className}
    />
  )
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  layout = "vertical",
  className,
}: {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showGridLines?: boolean
  layout?: "horizontal" | "vertical"
  className?: string
}) {
  return (
    <TremorBarChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showGridLines={showGridLines}
      layout={layout}
      className={className}
    />
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showGridLines = true,
  startEndOnly = false,
  className,
}: {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  showLegend?: boolean
  showGridLines?: boolean
  startEndOnly?: boolean
  className?: string
}) {
  return (
    <TremorLineChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      className={className}
    />
  )
}

