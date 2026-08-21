function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err.stack || err.message || err);

  const statusCode = err.statusCode || res.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    error: message,
    status: 'error',
  });
}

module.exports = errorHandler;
