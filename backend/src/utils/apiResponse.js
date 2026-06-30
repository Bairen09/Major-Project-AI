/**
 * Send a 200 success response
 */
const sendSuccess = (res, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(200).json(response);
};

/**
 * Send a 201 created response
 */
const sendCreated = (res, message = 'Created successfully', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(201).json(response);
};

/**
 * Send a 204 no content response
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send an error response
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendCreated, sendNoContent, sendError };
