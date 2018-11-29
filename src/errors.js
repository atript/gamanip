module.exports.ServiceError = class ServiceError extends Error {
  constructor(statusCode = 500, ...params) {
    if (params[0] instanceof Error) {
      super(params[0].message);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ServiceError);
      }
      const theStackFn = this.stack.toString().match(/at [\w]+/)[0];
      const theStackSrc = this.stack.toString().match(/\(([^)]+)/)[0];
      this.stacks = (params[0].stacks || []).concat(`- ${theStackFn} ${theStackSrc})`);
      this.stack = params[0].stack;
      this.statusCode = params[0].statusCode || statusCode;
      this.internalCode = params[0].internalCode || `${this.statusCode}-ServiceError`;
    } else {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
      super(...params);

      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ServiceError);
      }
      this.stacks = [];
      this.statusCode = statusCode;
      this.internalCode = `${this.statusCode}-ServiceError`;
    }
    // Custom debugging information
    this.date = new Date();
  }
  toString() {
    const failFunction = this.stack.toString().match(/at [\w]+/)[0];
    const failSource = this.stack.toString().match(/gamanip([^)]+)/)[0];
    return `[${this.statusCode}]{${this.internalCode}} ${
      this.message
    }: ${failFunction}(${failSource})`;
  }
  toJson() {
    const failFunction = this.stack.toString().match(/at [\w]+/)[0];
    const failSource = this.stack.toString().match(/gamanip([^)]+)/)[0];
    return {
      failFunction: `${failFunction}(${failSource})`,
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
      internalCode: this.internalCode,
      timestamp: this.date.getTime()
    };
  }
  toDebug() {
    const failFunction = this.stack.toString().match(/at [\w]+/)[0];
    const failSource = this.stack.toString().match(/gamanip([^)]+)/)[0];
    return `${this.date}
[${this.statusCode}]{${this.internalCode}} ${this.message}
- ${failFunction}(${failSource})
${this.stacks}`;
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
      message: errorMessage,
      response: {
        status: statusCode,
        statusText: message,
        data: { error: type }
      }
    } = err;
    // Custom debugging information
    this.statusCode = statusCode;
    this.message = `${message} ${errorMessage}`;
    this.internalCode = `${statusCode}-GoogleAnalyticsError`;
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

module.exports.errorHandler = (err) => Promise.reject(new module.exports.GoogleAnalyticsError(err));
/*
try {
  throw new ServiceError('baz', 'bazMessage');
} catch(e){
  console.log(e.foo); //baz
  console.log(e.message); //bazMessage
  console.log(e.stack); //stacktrace
}
*/
