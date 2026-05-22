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

import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import ChartContainer from '../ChartContainer';
import styles from './BasePieChart.module.scss';
import { Heading1, Text1 } from '../Typography';

type PieChartData = {
  name: string;
  value: number;
  color: string;
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
  isAnimationActive = true,
  centerValue,
  centerLabel,
}: BasePieChartProps) {
  return (
    <div className={styles.chartWrapper}>
      <ChartContainer height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            isAnimationActive={isAnimationActive}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip />

          {showLegend && <Legend verticalAlign="bottom" align="center" iconType="rect" />}
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
  );
}
