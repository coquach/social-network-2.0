'use client';

import { cn } from '@/lib/utils';
import { countChars } from '@/utils/count-chars';
import {
  Field,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { useCreatePostContext } from './context';
import { CreatePostComponentProps } from './types';

/**
 * Input - Text input area for post content
 * Includes character counter and validation
 */
export const CreatePostInput = ({ className }: Omit<CreatePostComponentProps, 'children'>) => {
  const { form, isPending, placeholder, maxWords } = useCreatePostContext();

  return (
    <FieldGroup className={className}>
      <form.Field
        name="content"
        validators={{
          onChange: ({ value }: any) => {
            const wc = countChars(value ?? '');
            if (wc > maxWords)
              return { message: `Tối đa ${maxWords} kí tự.` };
            return undefined;
          },
        }}
      >
        {(field: any) => {
          const value = (field.state.value ?? '') as string;
          const wordCount = countChars(value);

          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <InputGroup className="rounded-xl">
                <InputGroupTextarea
                  id={field.name}
                  name={field.name}
                  value={value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  rows={5}
                  disabled={isPending}
                  aria-invalid={isInvalid}
                  className={cn(
                    'max-h-40 resize-none overflow-y-auto min-h-10',
                    'whitespace-pre-wrap wrap-break-word'
                  )}
                />

                <InputGroupAddon align="block-end">
                  <InputGroupText
                    className={cn(
                      'tabular-nums',
                      isInvalid && 'text-red-600'
                    )}
                  >
                    {wordCount}/{maxWords} kí tự
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>

              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
    </FieldGroup>
  );
};
