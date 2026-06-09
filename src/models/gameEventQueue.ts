export function createGameEventQueue() {
  let chain: Promise<void> = Promise.resolve();

  return {
    enqueue(task: () => Promise<unknown>, onError?: (err: unknown) => void) {
      chain = chain
        .then(() => task())
        .then(() => undefined)
        .catch((err) => {
          onError?.(err);
        });
      return chain;
    },
  };
}
