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

  /**
   * Makes the steps clickable. Omitted, the stepper is purely a progress indicator — which is
   * also what lets it render from a Server Component (see below).
   */
  onStepChange?: (step: number) => void;
}

export default function Stepper({ currentStep, steps, onStepChange }: StepperProps) {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => {
        const Icon = step.icon;

        const isActive = index === currentStep;

        return (
          <div
            key={step.id}
            /*
              Only wired up when a handler was actually passed: this component carries no
              `'use client'`, so it renders on the server for callers like the wizard's loading
              skeleton — and a Server Component cannot hand an event handler to a DOM element.
              Attaching one unconditionally made every such render fail.
            */
            onClick={onStepChange && (() => onStepChange(index))}
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
