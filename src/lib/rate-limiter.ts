
// src/lib/rate-limiter.ts

const MAX_REQUESTS = parseInt(process.env.MAV_API_RATE_LIMIT_MAX_REQUESTS || '3000', 10);
const WINDOW_HOURS = parseFloat(process.env.MAV_API_RATE_LIMIT_WINDOW_HOURS || '1');
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

// Stores timestamps of requests, sorted ascending.
// This is an in-memory store, suitable for a single-instance deployment.
// For multi-instance deployments, a distributed store (e.g., Redis) would be needed.
const requestTimestamps: number[] = [];

export function isRateLimited(): boolean {
  const now = Date.now();

  // Remove timestamps older than the current window.
  // Older timestamps are at the beginning of the array.
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - WINDOW_MS) {
    requestTimestamps.shift(); // Remove the oldest timestamp
  }

  // Check if the number of requests in the current window exceeds the limit.
  if (requestTimestamps.length >= MAX_REQUESTS) {
    console.warn(
      `Rate limit exceeded. Requests in window: ${requestTimestamps.length}, Max allowed: ${MAX_REQUESTS}. Window: ${WINDOW_HOURS} hour(s).`
    );
    return true; // Rate limit exceeded
  }

  // Log the current request timestamp.
  requestTimestamps.push(now);
  return false; // Not rate limited
}
