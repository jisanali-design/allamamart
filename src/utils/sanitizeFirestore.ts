/**
 * Recursively sanitizes data payloads for Cloud Firestore:
 * - Converts any `undefined` values to `null` so Firestore does not throw:
 *   "Function setDoc() called with invalid data. Unsupported field value: undefined"
 * - Deeply cleans nested objects and arrays while preserving Firestore-safe values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value === undefined) {
      clean[key] = null;
    } else if (value !== null && typeof value === 'object') {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}
