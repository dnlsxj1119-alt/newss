export const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;
