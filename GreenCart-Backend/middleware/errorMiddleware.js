// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  // Determine the status code based on the error or default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send a JSON response with the error message
  res.json({
    message: err.message,
    // In development, you might want to send the stack trace for debugging
    // In production, you would typically omit the stack trace for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
