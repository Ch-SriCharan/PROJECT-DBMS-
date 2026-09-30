export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    let message = `Duplicate entry: A record with this ${field} already exists.`;

    if (err.message && (err.message.includes('doctorId') || err.message.includes('Appointment') || err.message.includes('startTime'))) {
      message = 'Appointment slot is no longer available. Please select another time slot.';
    }

    return res.status(409).json({
      success: false,
      message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({
      success: false,
      message: messages.join('. '),
    });
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with id of ${err.value}`,
    });
  }

  // Custom status code if provided
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
