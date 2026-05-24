// asyncHandler.js — saves you from wrapping every async controller in try/catch.
// Usage:
//   export const myController = asyncHandler(async (req, res) => { ... })
// If the async function throws, the error is forwarded to errorHandler middleware.

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
