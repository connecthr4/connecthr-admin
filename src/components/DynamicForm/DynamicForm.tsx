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

import React, { ComponentType, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  DefaultValues,
  Resolver,
  Path,
  PathValue,
  Controller,
  FormProvider,
  UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './DynamicForm.module.scss';
import TextInput from '../TextInput';
import { Heading4, TextAlign } from '../Typography/Typography';
import Checkbox from '../Checkbox';
import DatePicker from '../DatePicker';
import Dropdown from '../Dropdown';
import { DropdownOption } from '../Dropdown/Dropdown';
import { logger } from '@/src/lib/logger';

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
  schema: ZodType<T, T>;

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
  defaultValues?: DefaultValues<T>;

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

/**
 * A static heading rendered between groups of fields. It is never registered with the
 * form, so its name is only a React key rather than a path into the form values.
 */
export interface LabelFieldConfig {
  name: string;
  label?: string | ReactNode;
  type: 'label';
  className?: string;
  width?: FieldWidth;
  labelComponent?: ComponentType<any>;
}

/**
 * A field registered with the form, so its name has to be a path into the form values.
 */
export interface InputFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label?: string | ReactNode;
  type?: Exclude<FieldType, 'label'>;
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
  minDate?: Date;
  maxDate?: Date;
  options?: DropdownOption[];
  asyncOptions?: AsyncOptionsConfig<T>;
  searchable?: boolean;
  disabled?: boolean;
  disabledWhen?: Path<T>;
  syncFields?: {
    source: Path<T>;
    target: Path<T>;
  }[];
}

/**
 * Options that are fetched instead of declared up front, optionally scoped to another
 * field's value — districts belonging to the selected state, for instance.
 */
export interface AsyncOptionsConfig<T extends FieldValues> {
  /**
   * Field this one is scoped to. Options are only loaded once it holds a value, and are
   * reloaded whenever it changes.
   */
  dependsOn?: Path<T>;

  /**
   * Resolves the options, receiving the current value of `dependsOn` when one is set.
   * Callers are expected to memoize the lookup itself — this is called on mount and on
   * every change of the field it depends on.
   */
  load: (dependencyValue: string) => Promise<DropdownOption[]>;
}

export type FieldConfig<T extends FieldValues> = LabelFieldConfig | InputFieldConfig<T>;

type FieldType = 'label' | 'input' | 'checkbox' | 'datePicker' | 'dropdown';

type AsyncOptionsField<T extends FieldValues> = InputFieldConfig<T> & { asyncOptions: AsyncOptionsConfig<T> };

interface AsyncOptionsState {
  options: DropdownOption[];
  isLoading: boolean;
}

const EMPTY_ASYNC_OPTIONS: AsyncOptionsState = { options: [], isLoading: false };

/**
 * Loads the options for every field declaring `asyncOptions`, keeping a dependent field in
 * step with the one it is scoped to: its list is refetched when the dependency changes, and
 * a selection that does not survive into the new list is dropped rather than left behind as
 * a value the user can no longer see.
 */
function useAsyncOptions<T extends FieldValues>(
  fields: FieldConfig<T>[],
  watchedValues: T,
  methods: UseFormReturn<T>
): Record<string, AsyncOptionsState> {
  const [optionsByField, setOptionsByField] = useState<Record<string, AsyncOptionsState>>({});

  /**
   * Lists already resolved in this form, keyed by field and dependency value, so switching
   * back to a previous selection neither refetches nor flashes a spinner.
   */
  const loadedOptions = useRef(new Map<string, DropdownOption[]>());

  /**
   * Keeps a slow response from overwriting the list belonging to a newer selection.
   */
  const latestRequestIds = useRef<Record<string, number>>({});
  const requestCounter = useRef(0);

  const asyncFields = useMemo(
    () =>
      fields.filter((field): field is AsyncOptionsField<T> => field.type !== 'label' && Boolean(field.asyncOptions)),
    [fields]
  );

  /*
    `watchedValues` changes on every keystroke anywhere in the form, so the loads are keyed
    on just the values they actually depend on.
  */
  const dependencyKey = asyncFields
    .map(({ name, asyncOptions }) => `${name}=${asyncOptions.dependsOn ? watchedValues[asyncOptions.dependsOn] : ''}`)
    .join('&');

  useEffect(() => {
    const { getValues, setValue } = methods;

    const clearSelection = (name: Path<T>) => {
      if (getValues(name)) {
        setValue(name, '' as PathValue<T, Path<T>>);
      }
    };

    const applyOptions = (name: Path<T>, options: DropdownOption[]) => {
      setOptionsByField((previous) => ({ ...previous, [name]: { options, isLoading: false } }));

      // A value carried over from a previous dependency — or restored from a saved draft —
      // is not necessarily part of the list it is now being offered against.
      if (!options.some((option) => option.value === getValues(name))) {
        clearSelection(name);
      }
    };

    asyncFields.forEach(({ name, asyncOptions: { dependsOn, load } }) => {
      const dependencyValue = dependsOn ? String(getValues(dependsOn) ?? '') : '';
      const requestId = ++requestCounter.current;

      latestRequestIds.current[name] = requestId;

      // Nothing to load against yet, so the field is emptied rather than left offering the
      // options of whatever was selected before.
      if (dependsOn && !dependencyValue) {
        clearSelection(name);

        setOptionsByField((previous) => ({ ...previous, [name]: EMPTY_ASYNC_OPTIONS }));

        return;
      }

      const cached = loadedOptions.current.get(`${name}=${dependencyValue}`);

      if (cached) {
        applyOptions(name, cached);

        return;
      }

      setOptionsByField((previous) => ({ ...previous, [name]: { options: [], isLoading: true } }));

      load(dependencyValue)
        .then((options) => {
          loadedOptions.current.set(`${name}=${dependencyValue}`, options);

          if (latestRequestIds.current[name] !== requestId) return;

          applyOptions(name, options);
        })
        .catch((error) => {
          logger.error(`Error occurred while loading options for "${name}":`, error);

          if (latestRequestIds.current[name] !== requestId) return;

          setOptionsByField((previous) => ({ ...previous, [name]: EMPTY_ASYNC_OPTIONS }));
        });
    });
  }, [asyncFields, dependencyKey, methods]);

  return optionsByField;
}

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
  const asyncOptionsByField = useAsyncOptions(fields, watchedValues, methods);

  /**
   * Tracks the previous state of every checkbox driving a syncFields rule, so a sync
   * can tell an actual untick apart from a checkbox that simply starts off unticked.
   */
  const syncedCheckboxes = useRef<Partial<Record<Path<T>, boolean>>>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const isFieldDisabled = (field: InputFieldConfig<T>) => {
    if (!field.disabledWhen) return false;

    return Boolean(watchedValues[field.disabledWhen]);
  };

  useEffect(() => {
    reset(defaultValues);

    // Re-seed the tracker so restored values are not read as a checkbox being unticked.
    fields.forEach((field) => {
      if (field.type !== 'checkbox' || !field.syncFields) return;

      syncedCheckboxes.current[field.name] = Boolean(defaultValues?.[field.name]);
    });
  }, [defaultValues, fields, reset]);

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type !== 'checkbox' || !field.syncFields) return;

      const isChecked = Boolean(watchedValues[field.name]);
      const wasChecked = syncedCheckboxes.current[field.name];

      syncedCheckboxes.current[field.name] = isChecked;

      if (isChecked) {
        field.syncFields.forEach(({ source, target }) => {
          methods.setValue(target, watchedValues[source]);
        });

        return;
      }

      // Only clear the targets when the checkbox is actively unticked. Clearing on
      // every render would wipe the values restored through defaultValues.
      if (!wasChecked) return;

      field.syncFields.forEach(({ target }) => {
        methods.setValue(target, '' as PathValue<T, Path<T>>);
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
            disabled={field.disabled || isFieldDisabled(field)}
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

      case 'dropdown': {
        const asyncOptions = asyncOptionsByField[field.name];
        const dependsOn = field.asyncOptions?.dependsOn;

        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Dropdown
                label={field.label as string}
                placeholder={field.placeholder}
                options={field.options ?? asyncOptions?.options ?? ([] as DropdownOption[])}
                value={controllerField.value}
                onChange={controllerField.onChange}
                required={field.required}
                isLoading={asyncOptions?.isLoading}
                searchable={field.searchable}
                // There is nothing to choose from until the field this one is scoped to has
                // been answered, so it stays closed rather than opening on an empty list.
                disabled={field.disabled || isFieldDisabled(field) || Boolean(dependsOn && !watchedValues[dependsOn])}
                error={fieldState.error?.message}
              />
            )}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      {/*
        noValidate hands validation to the resolver. Fields marked required render a native
        required attribute, and without this the browser blocks submit before react-hook-form
        runs, so the inline messages never appear.
      */}
      <form
        noValidate
        data-testid="DynamicFormTest"
        className={clsx(styles.form, className)}
        onSubmit={handleSubmit(onSubmit)}
      >
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
