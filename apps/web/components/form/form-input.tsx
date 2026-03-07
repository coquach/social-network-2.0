import { Label } from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { FormErrors } from './form-errors';
import { FieldErrors } from 'react-hook-form';

interface FormInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: FieldErrors;
  className?: string;
  defaultValue?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
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
      <div className="space-y-2">
        <div className="space-y-1">
          {label ? (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          ) : null}
          <Input
            {...rest}
            defaultValue={defaultValue}
            ref={ref}
            required={required}
            name={id}
            id={id}
            placeholder={placeholder}
            type={type}
            disabled={pending || disabled}
            className={cn('text-sm px-2 py-1 h-10', className)}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={errors} />
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
