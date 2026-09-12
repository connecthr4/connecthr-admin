import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BasePieChart from './BasePieChart';
import styles from './BasePieChart.module.scss';

/*
jsdom has no layout, so Recharts' `ResponsiveContainer` never measures a size
and renders nothing inside. The container is stubbed to render its children
directly so the pie's slices can be asserted on; `ChartContainer` has tests of
its own.
*/
vi.mock('../ChartContainer', () => ({
  default: ({ children, height }: { children: React.ReactNode; height?: number | string }) => (
    <div data-testid="chart-container" data-height={height}>
      {children}
    </div>
  ),
}));

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');

  return {
    ...actual,
    /* A fixed-size chart, since nothing measures in jsdom. */
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <actual.PieChart width={400} height={400}>
        {children}
      </actual.PieChart>
    ),
  };
});

const data = [
  { name: 'Design', value: 12 },
  { name: 'Development', value: 30 },
  { name: 'Sales', value: 8 },
];

describe('BasePieChart', () => {
  it('renders a legend entry per slice by default', () => {
    render(<BasePieChart data={data} />);

    const legend = screen.getByRole('list');
    expect(legend).toHaveClass(styles.legend);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.textContent)).toEqual(['Design', 'Development', 'Sales']);
  });

  it('assigns each legend swatch a colour from the palette', () => {
    const { container } = render(<BasePieChart data={data} />);

    const swatches = Array.from(container.querySelectorAll(`.${styles.legendSwatch}`)) as HTMLElement[];
    expect(swatches).toHaveLength(3);

    const colours = swatches.map((swatch) => swatch.style.backgroundColor);
    expect(colours.every(Boolean)).toBe(true);
    expect(new Set(colours).size).toBe(3);
  });

  it('keeps a colour the data already carries', () => {
    const { container } = render(<BasePieChart data={[{ name: 'Design', value: 1, color: 'rgb(1, 2, 3)' }]} />);

    expect(container.querySelector(`.${styles.legendSwatch}`)).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });
  });

  it('hides the legend when showLegend is false', () => {
    render(<BasePieChart data={data} showLegend={false} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('positions the legend to the right by default and caps it at the chart height', () => {
    const { container } = render(<BasePieChart data={data} height={320} />);

    expect(container.querySelector(`.${styles.chart}`)).toHaveAttribute('data-legend-position', 'right');
    expect(screen.getByRole('list')).toHaveStyle({ maxHeight: '320px' });
  });

  it('lets the legend grow freely when positioned at the bottom', () => {
    const { container } = render(<BasePieChart data={data} height={320} legendPosition="bottom" />);

    expect(container.querySelector(`.${styles.chart}`)).toHaveAttribute('data-legend-position', 'bottom');
    expect(screen.getByRole('list')).not.toHaveAttribute('style');
  });

  it('hands the chart height to the container', () => {
    render(<BasePieChart data={data} height={240} />);

    expect(screen.getByTestId('chart-container')).toHaveAttribute('data-height', '240');
  });

  it('renders the centre value and label only when a value is given', () => {
    const { rerender } = render(<BasePieChart data={data} centerValue="50" centerLabel="Employees" />);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();

    rerender(<BasePieChart data={data} centerLabel="Employees" />);

    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
  });

  it('renders a coloured slice per data point', () => {
    const { container } = render(<BasePieChart data={data} isAnimationActive={false} />);

    const sectors = container.querySelectorAll('.recharts-pie-sector');
    expect(sectors).toHaveLength(3);
  });
});
