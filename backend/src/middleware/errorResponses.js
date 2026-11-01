import { HttpProblem, sendProblem } from '../http/problemDetails.js';

const BODY_PARSER_PROBLEMS = {
  'entity.parse.failed': () => new HttpProblem(400, 'Request body is not a valid JSON document'),
  'entity.too.large': () => new HttpProblem(413),
  'encoding.unsupported': () => new HttpProblem(415, 'Unsupported content encoding'),
  'charset.unsupported': () => new HttpProblem(415, 'Unsupported content encoding'),
};

export function apiNotFound(req, res) {
  sendProblem(req, res, new HttpProblem(404, `Path ${req.method} ${req.path} does not exist`));
}

export function methodNotAllowed(allowedMethods) {
  const allowHeader = allowedMethods.join(', ');
  return (req, res) => {
    sendProblem(req, res, new HttpProblem(405, `Resource supports methods: ${allowHeader}`, {
      headers: { Allow: allowHeader },
    }));
  };
}

// Express recognises an error handler by its four parameters, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpProblem) return sendProblem(req, res, error);

  const bodyParserProblem = BODY_PARSER_PROBLEMS[error.type];
  if (bodyParserProblem) return sendProblem(req, res, bodyParserProblem());

  console.error(`[error] ${req.method} ${req.originalUrl}:`, error);
  return sendProblem(req, res, new HttpProblem(500, 'An unexpected error occurred'));
}
