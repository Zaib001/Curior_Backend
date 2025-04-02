const CustomError = require('../utils/customError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
