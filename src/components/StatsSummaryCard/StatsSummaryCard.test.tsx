// import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsSummaryCard from './StatsSummaryCard';

describe('StatsSummaryCard', () => {
  const baseProps = {
    title: 'Employees',
    value: 120,
    icon: <span>📊</span>,
    updatedDate: '12 May 2026',
  };

  it('renders correctly', () => {
    render(<StatsSummaryCard {...baseProps} />);

    expect(screen.getByTestId('StatsSummaryCard')).toBeInTheDocument();
  });
});
