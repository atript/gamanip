module.exports.ServiceError = class ServiceError extends Error {
  constructor(statusCode = 500, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }

    // Custom debugging information
    this.statusCode = statusCode;
    this.internalCode = `${statusCode}-ServiceError`;
    this.date = new Date();
  }
  toString() {
    return `[${this.statusCode}]{${this.internalCode}} ${this.message}`;
  }
  toJson() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
      internalCode: this.internalCode,
      timestamp: this.date.getValue()
    };
  }
};

module.exports.GoogleAnalyticsError = class GoogleAnalyticsError extends Error {
  constructor(err, ...params) {
    super(...params);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GoogleAnalyticsError);
    }
    const {
      response: {
        status: statusCode,
        statusText: message,
        data: { error: type }
      }
    } = err;
    // Custom debugging information
    this.statusCode = statusCode;
    this.message = message;
    this.internalCode = `${statusCode}-${type}`;
    this.type = type;
    this.date = new Date();
  }
  toString() {
    const failFunction = this.stack.toString().match(/at [\w]+/)[0];
    const failSource = this.stack.toString().match(/gamanip([^)]+)/)[0];
    return `[${this.statusCode}/${this.internalCode}] ${
      this.message
    } : ${failFunction}(${failSource})`;
  }
  toJson() {
    const failFunction = this.stack.toString().match(/at [\w]+/)[0];
    const failSource = this.stack.toString().match(/gamanip([^)]+)/)[0];
    return {
      statusCode: this.statusCode,
      message: this.message,
      internalCode: this.internalCode,
      timestamp: this.date.getValue()
    };
  }
};

module.exports.errorHandler = (err) => new GoogleAnalyticsError(err);
/*
try {
  throw new ServiceError('baz', 'bazMessage');
} catch(e){
  console.log(e.foo); //baz
  console.log(e.message); //bazMessage
  console.log(e.stack); //stacktrace
}
*/
