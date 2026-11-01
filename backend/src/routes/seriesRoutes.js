import { Router } from 'express';
import * as seriesController from '../controllers/seriesController.js';
import { requireAdmin } from '../middleware/authentication.js';
import { methodNotAllowed } from '../middleware/errorResponses.js';

const router = Router();

router.route('/')
  .get(seriesController.listSeries)
  .post(requireAdmin, seriesController.createSeries)
  .all(methodNotAllowed(['GET', 'POST']));

router.route('/:id')
  .get(seriesController.getSeries)
  .put(requireAdmin, seriesController.updateSeries)
  .delete(requireAdmin, seriesController.deleteSeries)
  .all(methodNotAllowed(['GET', 'PUT', 'DELETE']));

export default router;
