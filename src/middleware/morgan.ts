import morgan from 'morgan';
import logger from '@/config/logger';

// Create a custom token for request body logging
morgan.token('body', (req: any) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }
  return '';
});

// Create a custom token for response body logging
morgan.token('response-body', (_: any, res: any) => {
  if (res.locals.responseBody) {
    return JSON.stringify(res.locals.responseBody);
  }
  return '';
});

// Custom format for development
const devFormat = ':method :url :status :response-time ms - :body';

// Custom format for production
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const format =
  process.env['NODE_ENV'] === 'production' ? prodFormat : devFormat;

// Create the morgan middleware
const morganMiddleware = morgan(format, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});

export default morganMiddleware;
