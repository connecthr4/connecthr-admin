import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ChartContainer from './ChartContainer';
import styles from './ChartContainer.module.scss';

describe('ChartContainer', () => {
  it('renders the container at the default height', () => {
    const { container } = render(
      <ChartContainer>
        <div>chart</div>
      </ChartContainer>
    );

    const wrapper = container.querySelector(`.${styles.chartContainer}`) as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ height: '300px' });
  });

  it('applies a numeric height in pixels', () => {
    const { container } = render(
      <ChartContainer height={480}>
        <div>chart</div>
      </ChartContainer>
    );

    expect(container.querySelector(`.${styles.chartContainer}`)).toHaveStyle({ height: '480px' });
  });

  it('passes a string height through untouched', () => {
    const { container } = render(
      <ChartContainer height="50vh">
        <div>chart</div>
      </ChartContainer>
    );

    expect(container.querySelector(`.${styles.chartContainer}`)).toHaveStyle({ height: '50vh' });
  });

  it('merges a custom class name onto the container', () => {
    const { container } = render(
      <ChartContainer className="custom">
        <div>chart</div>
      </ChartContainer>
    );

    expect(container.querySelector(`.${styles.chartContainer}`)).toHaveClass('custom');
  });

  it('wraps the chart in a responsive container that fills the wrapper', () => {
    const { container } = render(
      <ChartContainer>
        <div>chart</div>
      </ChartContainer>
    );

    const responsive = container.querySelector('.recharts-responsive-container') as HTMLElement;
    expect(responsive).toBeInTheDocument();
    expect(responsive).toHaveStyle({ width: '100%', height: '100%' });
  });
});
