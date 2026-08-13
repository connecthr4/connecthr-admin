/**
 * Reusable base component for rendering responsive pie and donut charts across the application.
 *
 * @example
 * ```tsx
 * import BasePieChart from '@src/components/BasePieChart'
 *
 * export default function BasePieChart() {
 *   return <BasePieChart label="Hello" />;
 * }
 * ```
 */
'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import ChartContainer from '../ChartContainer';
import { Heading1, Text1, Text4 } from '../Typography';
import { CHART_SLICE_GAP, CHART_SURFACE_COLOR } from '@/src/constants/chart';
import { withChartColors } from '@/src/utils/chartColors';
import styles from './BasePieChart.module.scss';

type PieChartData = {
  name: string;
  value: number;
  /**
   * Optional — series that come from the API carry no colour, so the chart
   * falls back to the shared categorical palette.
   */
  color?: string;
};

/**
 * Define the props available for the BasePieChart component.
 */
interface BasePieChartProps {
  data: PieChartData[];
  height?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  /**
   * Where the legend sits relative to the plot. A series with many entries —
   * or long names — reads better in the vertical `right` list, which is why
   * that is the default; `bottom` wraps onto as many rows as it needs.
   */
  legendPosition?: 'right' | 'bottom';
  isAnimationActive?: boolean;
  centerValue?: string;
  centerLabel?: string;
}

export default function BasePieChart({
  data,
  height = 500,
  innerRadius = '80%',
  outerRadius = '100%',
  showLegend = true,
  legendPosition = 'right',
  isAnimationActive = true,
  centerValue,
  centerLabel,
}: BasePieChartProps) {
  /* Colours are resolved once per data set rather than on every render. */
  const coloredData = useMemo(() => withChartColors(data), [data]);

  return (
    <div className={styles.chart} data-legend-position={legendPosition}>
      <div className={styles.chartWrapper}>
        <ChartContainer height={height}>
          <PieChart>
            <Pie
              data={coloredData}
              dataKey="value"
              nameKey="name"
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              isAnimationActive={isAnimationActive}
              /* Keeps a hairline of the surface between slices so two close hues never touch. */
              stroke={CHART_SURFACE_COLOR}
              strokeWidth={CHART_SLICE_GAP}
            >
              {coloredData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ChartContainer>

        {/* Center Content */}
        {centerValue && (
          <div className={styles.centerContent}>
            <Heading1>{centerValue}</Heading1>
            <Text1 className={styles.label}>{centerLabel}</Text1>
          </div>
        )}
      </div>

      {/*
        The legend is plain markup rather than Recharts' own, which is painted
        inside the SVG and so clips the first and last entries once the labels
        are wider than the plot.
      */}
      {showLegend && (
        <ul
          className={styles.legend}
          /* Keeps a long series inside the plot's height rather than growing the card. */
          style={legendPosition === 'right' ? { maxHeight: height } : undefined}
        >
          {coloredData.map((entry) => (
            <li key={entry.name} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ backgroundColor: entry.color }} aria-hidden="true" />
              <Text4 className={styles.legendLabel} title={entry.name}>
                {entry.name}
              </Text4>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
