'use client';

import { Label } from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { useFormStatus } from 'react-dom';
import { FieldErrors } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { FormErrors } from './form-errors';
import { cn } from '@/lib/utils';

interface FormTextareaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: FieldErrors;
  className?: string;
  defaultValue?: string;
}
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required,
      disabled,
      errors,
      className,
      defaultValue,
      ...rest
    },
    ref
  ) => {
    const { pending } = useFormStatus();

    return (
      <div className="space-y-2 w-full">
        <div className="space-y-1 w-full">
          {label ? (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          ) : null}
          <Textarea
            {...rest}
            defaultValue={defaultValue}
            ref={ref}
            required={required}
            name={id}
            id={id}
            placeholder={placeholder}
            disabled={pending || disabled}
            className={cn(
              'resize-none w-full focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 focus:border-gray-500 outline-1 shadow-none transition-all',
              className
            )}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
