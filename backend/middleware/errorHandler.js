// basic error handler middleware - catches anything passed to next(err)
function errorHandler(err, req, res, next) {
  console.log(err); // helpful for debugging while developing
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;
