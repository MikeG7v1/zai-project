import helmet from 'helmet';

const ONE_YEAR_SECONDS = 31536000;

export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
    },
    strictTransportSecurity: { maxAge: ONE_YEAR_SECONDS, includeSubDomains: true },
    referrerPolicy: { policy: 'no-referrer' },
  });
}
