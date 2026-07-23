import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckCircle, FileText, User } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import Stepper from './Stepper';
import styles from './Stepper.module.scss';

const steps = [
  { id: 'details', label: 'Personal details', icon: User },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'review', label: 'Review & submit', icon: CheckCircle },
];

describe('Stepper', () => {
  it('renders a step with a label and icon for every item', () => {
    render(<Stepper currentStep={0} steps={steps} />);

    expect(screen.getByText('Personal details')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Review & submit')).toBeInTheDocument();
    expect(document.querySelectorAll('svg')).toHaveLength(steps.length);
  });

  it('marks only the current step and its label as active', () => {
    render(<Stepper currentStep={1} steps={steps} />);

    const activeStep = screen.getByText('Documents').closest('div');
    const inactiveStep = screen.getByText('Personal details').closest('div');

    expect(activeStep).toHaveClass(styles.active);
    expect(screen.getByText('Documents')).toHaveClass(styles.activeLabel);
    expect(inactiveStep).not.toHaveClass(styles.active);
    expect(screen.getByText('Personal details')).not.toHaveClass(styles.activeLabel);
  });

  it('calls onStepChange with the index of the clicked step', async () => {
    const onStepChange = vi.fn();
    const user = userEvent.setup();

    render(<Stepper currentStep={0} onStepChange={onStepChange} steps={steps} />);

    await user.click(screen.getByText('Review & submit'));
    expect(onStepChange).toHaveBeenCalledTimes(1);
    expect(onStepChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByText('Documents'));
    expect(onStepChange).toHaveBeenCalledTimes(2);
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('does not throw when a step is clicked without an onStepChange handler', async () => {
    const user = userEvent.setup();
    render(<Stepper currentStep={0} steps={steps} />);

    await expect(user.click(screen.getByText('Documents'))).resolves.not.toThrow();
  });

  it('renders an empty container when given no steps', () => {
    const { container } = render(<Stepper currentStep={0} steps={[]} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
