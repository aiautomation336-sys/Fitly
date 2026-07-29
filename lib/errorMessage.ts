export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return 'Что-то пошло не так, попробуй ещё раз.';
}
