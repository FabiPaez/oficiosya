export function errorMiddleware(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'Error interno del servidor'
        : err.message,
    ...(err.details && { details: err.details }),
  });
}