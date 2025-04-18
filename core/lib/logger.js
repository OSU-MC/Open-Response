const winston = require('winston')
const morgan = require('morgan')
require('winston-daily-rotate-file')
const { combine, timestamp, printf, colorize, align, errors } = winston.format

const env = process.env.NODE_ENV  || 'development'
const dev = (env === 'development')
const debug = (dev || env === 'test')

if (debug) { // dotenv file will only be used in dev and testing
  require('dotenv').config({ override: false}); // will not override current environment variables if they exist
}

// LOG_LEVEL takes precedence. If development, the log level should be debug. Otherwise, default to info
let logLevel = process.env.LOG_LEVEL || (debug ? 'debug' : 'info')

const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    winston.format(info => {
        info.level = info.level.toUpperCase()
        return info;
      })(),
    errors({ stack: true }),
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => {
        let stack
        if (info.stack) {
            stack = `\n${info.stack}`
        }

        // stack will exist only for messages with error objects
        return `[${info.timestamp}] ${info.level}: ${info.message}${stack ? stack : ''}`
    })
  ),
  // if dev, log to the console. Otherwise, use file logging
  transports: dev ? [new winston.transports.Console()] : [
    new winston.transports.DailyRotateFile({
        filename: './logs/production-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
      }),
    new winston.transports.DailyRotateFile({
        filename: './logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        level: 'error'
    })
  ],
})

const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
      stream: {
        // Configure Morgan to use our winston logger with the http severity
        write: (message) =>  {
            logger.http(message.trim())
        }
      },
    }
  );

module.exports = {
    logger,
    morganMiddleware
}

/*

src: https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/

Logger Levels:
    {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    }

"The level property on the logger determines which log messages will be emitted to the configured transports (discussed later)
For example, since the level property was set to info in the previous section, only log entries with a minimum severity of
info (or maximum integer priority of 2) will be written while all others are suppressed"

To use the logger, simply invoke a log level on the logger object (module export): logger.error("this is an error message")
will produce an error level message on the log

*/