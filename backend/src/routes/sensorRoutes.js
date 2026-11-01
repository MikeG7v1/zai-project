import { Router } from 'express';
import * as sensorController from '../controllers/sensorController.js';
import { requireAdmin } from '../middleware/authentication.js';
import { methodNotAllowed } from '../middleware/errorResponses.js';

const router = Router();

router.use(requireAdmin);

router.route('/')
  .get(sensorController.listSensors)
  .post(sensorController.registerSensor)
  .all(methodNotAllowed(['GET', 'POST']));

router.route('/:id')
  .get(sensorController.getSensor)
  .delete(sensorController.deregisterSensor)
  .all(methodNotAllowed(['GET', 'DELETE']));

export default router;
