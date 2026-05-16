/**
 * Reusable responsive container component for rendering charts consistently across the application.
 *
 * @example
 * ```tsx
 * import ChartContainer from '@src/components/ChartContainer'
 *
 * export default function ChartContainer() {
 *   return <ChartContainer label="Hello" />;
 * }
 * ```
 */
'use client';

import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import styles from './ChartContainer.module.scss';

/**
 * Define the props available for the ChartContainer component.
 */
interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
}

export default function ChartContainer({ children,
  height = 300,
  className = "", }: ChartContainerProps) {
  return (
    <div
      className={`${styles.chartContainer} ${className}`}
      style={{
        height,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
