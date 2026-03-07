import { ZodIssue } from 'zod';

export function zodToFieldErrorMap(issues: ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const issue of issues ?? []) {
    const key = issue?.path?.[0] as string | undefined;
    if (!key) continue;
    if (!out[key]) out[key] = issue.message; // take first error per field
  }
  return out;
}