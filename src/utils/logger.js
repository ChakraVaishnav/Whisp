const isProd = process.env.NODE_ENV === 'production';

function noop() {}

const logger = {
  log: isProd ? noop : (...args) => console.log(...args),
  info: isProd ? noop : (...args) => console.info(...args),
  warn: isProd ? noop : (...args) => console.warn(...args),
  error: isProd ? noop : (...args) => console.error(...args),
  debug: isProd ? noop : (...args) => console.debug(...args),
};

export default logger;
