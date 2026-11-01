import { Router } from 'express';
import * as measurementController from '../controllers/measurementController.js';
import { requireSensor } from '../middleware/authentication.js';
import { methodNotAllowed } from '../middleware/errorResponses.js';

const router = Router();

router.route('/')
  .get(measurementController.listMeasurements)
  .post(requireSensor, measurementController.recordMeasurement)
  .all(methodNotAllowed(['GET', 'POST']));

router.route('/:id')
  .get(measurementController.getMeasurement)
  .all(methodNotAllowed(['GET']));

export default router;
