const STATUS_TITLES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  413: 'Content Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Content',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

export class HttpProblem extends Error {
  constructor(status, detail, { errors, headers } = {}) {
    const title = STATUS_TITLES[status] || 'Error';
    super(detail || title);
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.errors = errors;
    this.headers = headers;
  }
}

export function sendProblem(req, res, problem) {
  const body = {
    type: 'about:blank',
    title: problem.title,
    status: problem.status,
  };
  if (problem.detail) body.detail = problem.detail;
  body.instance = req.originalUrl;
  if (problem.errors?.length) body.errors = problem.errors;

  if (problem.headers) res.set(problem.headers);
  res.status(problem.status).type('application/problem+json').send(JSON.stringify(body));
}

export const badRequest = (detail, errors) => new HttpProblem(400, detail, { errors });
export const unauthorized = (detail, authenticateHeader = 'Bearer') =>
  new HttpProblem(401, detail, { headers: { 'WWW-Authenticate': authenticateHeader } });
export const forbidden = (detail) => new HttpProblem(403, detail);
export const notFound = (detail) => new HttpProblem(404, detail);
export const conflict = (detail) => new HttpProblem(409, detail);
export const unprocessable = (detail, errors) => new HttpProblem(422, detail, { errors });
