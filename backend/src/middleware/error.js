export function notFound(req, res, _next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error(err);
  }
  res.status(statusCode).json({ message });
}

export default errorHandler;
