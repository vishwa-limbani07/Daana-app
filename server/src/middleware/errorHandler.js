// errorHandler.js — last-resort error catcher.
// Mounted as the LAST app.use() in app.js. Any error thrown (or passed to next())
// from any route lands here. Without this, you get ugly stack traces sent to clients.

export const errorHandler = (err, req, res, _next) => {
  console.error('[error]', err);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    message,
    // Show stack only in dev — never leak it in production responses.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
