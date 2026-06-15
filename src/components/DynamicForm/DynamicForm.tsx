/**
 * The DynamicForm component is a reusable dynamic form builder that generates form fields based on a given configuration
 *
 * @example
 * ```tsx
 * import DynamicForm from '@src/components/DynamicForm'
 *
 * export default function DynamicForm() {
 *   return <DynamicForm label="Hello" />;
 * }
 * ```
 */
'use client';

import React, { ComponentType, ReactNode, useEffect } from 'react';
import { useForm, SubmitHandler, FieldValues, Resolver, Path, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './DynamicForm.module.scss';
import TextInput from '../TextInput';
import { Heading4, TextAlign } from '../Typography/Typography';
import Checkbox from '../Checkbox';
import DatePicker from '../DatePicker';

/**
 * Define the props available for the DynamicForm component.
 */
interface DynamicFormProps<T extends FieldValues> {
  /**
   * Array of field configurations used to dynamically render form fields.
   */
  fields: FieldConfig<T>[];

  /**
   * Zod schema used for form validation.
   */
  schema: ZodSchema<T>;

  /**
   * CSS class name applied to the form container.
   */
  className?: string;

  /**
   * Callback function executed when the form is submitted.
   */
  onSubmit: SubmitHandler<T>;

  /**
   *
   */
  defaultValues?: Partial<T>;

  /**
   *
   */
  footer?: React.ReactNode;
}

/**
 * Enum for safe width values
 */
export enum FieldWidth {
  FULL = 'full',
  HALF = 'half',
  THIRD = 'third',
}

export interface FieldConfig<T extends FieldValues> {
  name: Path<T>;
  label?: string | ReactNode;
  type?: FieldType;
  placeholder?: string;
  className?: string;
  children?: ReactNode;
  width?: FieldWidth;
  required?: boolean;
  buttonType?: 'button' | 'submit' | 'reset';
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  iconColor?: string;
  textAlign?: TextAlign;
  maxLength?: number;
  labelComponent?: ComponentType<any>;
  minDate?: Date;
  maxDate?: Date;
  disabledWhen?: Path<T>;
  syncFields?: {
    source: Path<T>;
    target: Path<T>;
  }[];
}

type FieldType = 'label' | 'input' | 'checkbox' | 'datePicker';

export default function DynamicForm<T extends FieldValues>({
  fields,
  schema,
  className,
  onSubmit,
  defaultValues,
  footer,
}: DynamicFormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues,
  });
  const watchedValues = methods.watch();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const isFieldDisabled = (field: FieldConfig<T>) => {
    if (!field.disabledWhen) return false;

    return Boolean(watchedValues[field.disabledWhen]);
  };

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type !== 'checkbox' || !field.syncFields) return;

      const isChecked = watchedValues[field.name];

      field.syncFields.forEach(({ source, target }) => {
        if (isChecked) {
          methods.setValue(target, watchedValues[source]);
        } else {
          methods.setValue(target, '');
        }
      });
    });
  }, [watchedValues, fields, methods]);

  const renderField = (field: FieldConfig<T>) => {
    switch (field.type) {
      case 'label': {
        const Component = field.labelComponent || Heading4;
        return <Component className={field.className}>{field.label}</Component>;
      }

      case 'input':
        return (
          <TextInput
            {...register(field.name)}
            label={field.label}
            placeholder={field.placeholder}
            disabled={isFieldDisabled(field)}
            type={field.type}
            required={field.required}
            className={field.className}
            maxLength={field.maxLength}
            error={errors[field.name]?.message as string}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={methods.control}
            render={({ field: controllerField }) => (
              <Checkbox
                label={field.label}
                checked={controllerField.value}
                onChange={controllerField.onChange}
                error={errors[field.name]?.message as string}
                required={field.required}
              />
            )}
          />
        );

      case 'datePicker':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <DatePicker
                label={field.label as string}
                value={controllerField.value}
                onChange={controllerField.onChange}
                required={field.required}
                minDate={field.minDate}
                maxDate={field.maxDate}
                error={errors[field.name]?.message as string}
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form data-testid="DynamicFormTest" className={clsx(styles.form, className)} onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field) => (
          <div key={field.name} className={clsx(styles.field, styles[`field--${field.width || FieldWidth.FULL}`])}>
            {renderField(field)}
          </div>
        ))}
        <div className={styles.footerWrapper}>{footer}</div>
      </form>
    </FormProvider>
  );
}
