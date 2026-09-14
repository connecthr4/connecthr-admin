import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CircleX } from 'lucide-react';

import SuccessBadge from './SuccessBadge';
import styles from './SuccessBadge.module.scss';

describe('SuccessBadge', () => {
  it('renders the badge with the default check icon at the default size', () => {
    const { container } = render(<SuccessBadge />);

    const badge = container.querySelector(`.${styles.badge}`) as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ width: '48px', height: '48px' });

    const icon = badge.querySelector('svg');
    expect(icon).toHaveClass('lucide-circle-check');
  });

  it('scales the icon to just over half the badge size', () => {
    const { container } = render(<SuccessBadge size={64} />);

    const badge = container.querySelector(`.${styles.badge}`) as HTMLElement;
    expect(badge).toHaveStyle({ width: '64px', height: '64px' });

    const icon = badge.querySelector('svg');
    expect(icon).toHaveAttribute('width', '35');
    expect(icon).toHaveAttribute('height', '35');
  });

  it('renders a custom icon when one is given', () => {
    const { container } = render(<SuccessBadge icon={CircleX} />);

    expect(container.querySelector('svg')).toHaveClass('lucide-circle-x');
  });

  it('merges a custom class name onto the badge', () => {
    const { container } = render(<SuccessBadge className="custom" />);

    const badge = container.querySelector(`.${styles.badge}`);
    expect(badge).toHaveClass('custom');
  });

  it('keeps the icon decorative so it is not read out beside the outcome text', () => {
    const { container } = render(<SuccessBadge />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
