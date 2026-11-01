const HEALTH_CHECK_PATH = '/api/health';

/** The hosting platform probes the health check over plain http, so that path is not redirected. */
export function httpsRedirect(req, res, next) {
  if (req.secure || req.path === HEALTH_CHECK_PATH) return next();
  res.redirect(308, `https://${req.get('host')}${req.originalUrl}`);
}
