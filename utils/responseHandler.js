// utils/responseHandler.js

export const responseHandler = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, message = 'Something went wrong', statusCode = 500, data = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
    });
  },

  notFound: (res, message = 'Resource not found') => {
    return res.status(404).json({
      success: false,
      message,
    });
  },
};