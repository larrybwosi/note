import React, { useCallback, useState } from 'react';
import { z } from 'zod';

type FieldValues = Record<string, any>;

type UseFormReturn<TFieldValues extends FieldValues = FieldValues> = {
  control: UseFormReturn<TFieldValues>;
  errors: Record<keyof TFieldValues, { message: string }>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  onChange: (event: React.ChangeEvent<any>) => void;
  register: (name: keyof TFieldValues) => {
    onChange: (event: React.ChangeEvent<any>) => void;
    onBlur: () => void;
    name: keyof TFieldValues;
    value: string;
  };
  handleSubmit: (onSubmit: (data: TFieldValues) => void) => (e: React.FormEvent) => void;
  formState: {
    errors: Record<keyof TFieldValues, { message: string }>;
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
  };
  reset: (values?: Partial<TFieldValues>) => void;
  setError: (name: keyof TFieldValues, error: { type: string; message: string }) => void;
  clearErrors: (name?: keyof TFieldValues) => void;
  setValue: (name: keyof TFieldValues, value: any, options?: { shouldValidate?: boolean }) => void;
  getValues: () => TFieldValues;
  trigger: (name?: keyof TFieldValues) => Promise<boolean>;
  watch: (name?: keyof TFieldValues) => any;
};

export function useForm<TFieldValues extends FieldValues = FieldValues>(
  options?: { defaultValues?: Partial<TFieldValues>; validationSchema?: z.ZodSchema<TFieldValues> }
): UseFormReturn<TFieldValues> {
  const [formState, setFormState] = useState<TFieldValues>((options?.defaultValues || {}) as TFieldValues);
  const [errors, setErrors] = useState<Record<keyof TFieldValues, { message: string }>>({} as Record<keyof TFieldValues, { message: string }>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validateField = useCallback((name: keyof TFieldValues, value: any) => {
    if (options?.validationSchema) {
      try {
        options.validationSchema.pick({ [name]: true }).parse({ [name]: value });
        setErrors(prev => ({ ...prev, [name]: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(prev => ({ ...prev, [name]: { message: error.errors[0].message } }));
        }
      }
    }
  }, [options?.validationSchema]);

  const register = (name: keyof TFieldValues) => ({
    onChange: (event: React.ChangeEvent<any>) => {
      const value = event.target.value;
      setFormState(prev => ({ ...prev, [name]: value }));
      setIsDirty(true);
      validateField(name, value);
    },
    onBlur: () => validateField(name, formState[name]),
    name,
    value: formState[name] || '',
  });

  const handleSubmit = useCallback((onSubmit: (data: TFieldValues) => void) => async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (options?.validationSchema) {
      try {
        await options.validationSchema.parseAsync(formState);
        setErrors({} as Record<keyof TFieldValues, { message: string }>);
        setIsValid(true);
        await onSubmit(formState);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = error.errors.reduce((acc, curr) => {
            acc[curr.path[0] as keyof TFieldValues] = { message: curr.message };
            return acc;
          }, {} as Record<keyof TFieldValues, { message: string }>);
          setErrors(newErrors);
          setIsValid(false);
        }
      }
    } else {
      await onSubmit(formState);
    }
    setIsSubmitting(false);
  }, [formState, options?.validationSchema]);

  const reset = useCallback((values?: Partial<TFieldValues>) => {
    setFormState(values ? { ...formState, ...values } : {} as TFieldValues);
    setErrors({} as Record<keyof TFieldValues, { message: string }>);
    setIsDirty(false);
    setIsValid(true);
  }, []);

  const setError = useCallback((name: keyof TFieldValues, error: { type: string; message: string }) => {
    setErrors(prev => ({ ...prev, [name]: { message: error.message } }));
    setIsValid(false);
  }, []);

  const clearErrors = useCallback((name?: keyof TFieldValues) => {
    if (name) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } else {
      setErrors({} as Record<keyof TFieldValues, { message: string }>);
    }
    setIsValid(true);
  }, []);

  const setValue = useCallback((name: keyof TFieldValues, value: any, options?: { shouldValidate?: boolean }) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (options?.shouldValidate) {
      validateField(name, value);
    }
  }, [validateField]);

  const getValues = useCallback(() => formState, [formState]);

  const trigger = useCallback(async (name?: keyof TFieldValues) => {
    if (name) {
      validateField(name, formState[name]);
    } else if (options?.validationSchema) {
      try {
        await options.validationSchema.parseAsync(formState);
        setErrors({} as Record<keyof TFieldValues, { message: string }>);
        setIsValid(true);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = error.errors.reduce((acc, curr) => {
            acc[curr.path[0] as keyof TFieldValues] = { message: curr.message };
            return acc;
          }, {} as Record<keyof TFieldValues, { message: string }>);
          setErrors(newErrors);
          setIsValid(false);
          return false;
        }
      }
    }
    return isValid;
  }, [formState, options?.validationSchema, validateField, isValid]);

  const watch = useCallback((name?: keyof TFieldValues) => {
    if (name) {
      return formState[name];
    }
    return formState;
  }, [formState]);

  return {
    control: {
      register,
      handleSubmit,
      formState: {
        errors,
        isSubmitting,
        isDirty,
        isValid,
      },
      reset,
      setError,
      clearErrors,
      setValue,
      getValues,
      trigger,
      watch,
    },
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isDirty,
      isValid,
    },
    reset,
    setError,
    clearErrors,
    setValue,
    getValues,
    trigger,
    watch,
  };
}

type ControllerProps<TFieldValues extends FieldValues = FieldValues> = {
  name: keyof TFieldValues;
  control: UseFormReturn<TFieldValues>;
  render: ({ field }: { field: ReturnType<UseFormReturn<TFieldValues>['register']> }) => React.ReactElement;
};

export function Controller<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  render,
}: ControllerProps<TFieldValues>): React.ReactElement {
  const field = control.register(name);
  return render({ field });
}

export const zodResolver = <T extends z.ZodType<any, any>>(schema: T) => {
  return (values: z.infer<T>) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, curr) => {
          acc[curr.path.join('.')] = { message: curr.message };
          return acc;
        }, {} as Record<string, { message: string }>);
      }
      return {};
    }
  };
};
