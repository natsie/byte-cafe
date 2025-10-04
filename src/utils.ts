export const noop = (..._args: unknown[]): null => null;
export const nonNull = <T>(value: T, message?: string): NonNullable<T> => {
  if (value != null) return value;
  throw new TypeError(message || "Value is nullish.");
};

interface DeferResult<T> {
  promise: Promise<T>;
  resolve: (value: T) => null;
  reject: (reason: unknown) => null;
}

export const defer = async <T = unknown>(): Promise<DeferResult<T>> => {
  const result: DeferResult<T> = {
    promise: Promise.resolve(null as T),
    resolve: noop,
    reject: noop,
  };

  await new Promise(async (rresolve) => {
    result.promise = new Promise<T>((resolve, reject) => {
      result.resolve = (value: T) => (resolve(value), null);
      result.reject = (reason: unknown) => (reject(reason), null);
      rresolve(null);
    });
  });

  return result;
};
