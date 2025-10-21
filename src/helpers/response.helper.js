exports.successResponse = (res, data, status = 200) => {
  return res.status(status).json({ 
    success: true, 
    data,
    timestamp: new Date().toISOString()
  });
};

exports.errorResponse = (res, message, status = 500, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return res.status(status).json(response);
};