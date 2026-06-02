/**
 * A reusable navigation component that visually represents progress and the current position within a multi-step workflow.
 *
 * @example
 * ```tsx
 * import Stepper from '@src/components/Stepper'
 *
 * export default function Stepper() {
 *   return <Stepper label="Hello" />;
 * }
 * ```
 */

import { LucideIcon } from 'lucide-react';
import styles from './Stepper.module.scss';
import clsx from 'clsx';
import { Text4 } from '../Typography/Typography';

interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Define the props available for the Stepper component.
 */
interface StepperProps {
  currentStep: number;
  steps: readonly Step[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => {
        const Icon = step.icon;

        const isActive = index === currentStep;

        return (
          <div
            key={step.id}
            className={clsx(styles.step, {
              [styles.active]: isActive,
            })}
          >
            <Icon size={24} />
            <Text4
              className={clsx({
                [styles.activeLabel]: isActive,
              })}
            >
              {step.label}
            </Text4>
          </div>
        );
      })}
    </div>
  );
}
