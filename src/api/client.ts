/**
 * Simulates network latency for a realistic React Query experience.
 * Swapping to a real API requires only changing this file.
 */
export const simulateApiCall = <T>(data: T, delayMs = 120): Promise<T> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data) as T), delayMs),
  );
