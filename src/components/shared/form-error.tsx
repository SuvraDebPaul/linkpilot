type FormErrorProps = {
  message?: string | null;
  className?: string;
};

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p className={`text-sm text-destructive ${className ?? ""}`} role="alert">
      {message}
    </p>
  );
}

type FieldErrorProps = {
  errors?: Record<string, string>;
  field: string;
};

export function FieldError({ errors, field }: FieldErrorProps) {
  const msg = errors?.[field];
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {msg}
    </p>
  );
}
