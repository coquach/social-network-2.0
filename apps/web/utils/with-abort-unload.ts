export const withAbortOnUnload = async <T>(
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> => {
  const controller = new AbortController();
  const handler = () => controller.abort();

  window.addEventListener('beforeunload', handler);

  try {
    return await fn(controller.signal);
  } finally {
    window.removeEventListener('beforeunload', handler);
  }
};
