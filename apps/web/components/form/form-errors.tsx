
import { XCircle } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';

interface FormErrorsProps {
  id: string;
  errors?: FieldErrors;
}

export const FormErrors = ({ id, errors }: FormErrorsProps) => {
  if (!errors || !errors[id]) return null;

  const fieldError = errors[id];
  return (
    <div
      id={`${id}-error`}
      aria-live="polite"
      className="mt-2 text-xs text-rose-500"
    >
      {'message' in (fieldError ?? {}) && fieldError?.message && (
        <div className="flex items-center font-medium p-2 border border-rose-500 bg-rose-500/10 rounded-sm">
          <XCircle className="h-4 w-4 mr-2" />
          {String(fieldError.message)}
        </div>
      )}
    </div>
  );

};
