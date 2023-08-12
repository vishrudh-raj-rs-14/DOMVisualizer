const notFoundErr = (req, res, next) => {
  res.statusCode = 404;
  const error = new Error(`Route not found :${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode != 200 ? res.statusCode : 500;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    err.message = "Resource not found";
  }

  const stack = process.env.NODE_ENV == "development" ? err.stack : null;
  res.status(statusCode).json({
    status: "fail",
    message: err.message,
    stack,
  });
};

module.exports = { notFoundErr, errorHandler };
