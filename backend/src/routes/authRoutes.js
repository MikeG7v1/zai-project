import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authentication.js';
import { methodNotAllowed } from '../middleware/errorResponses.js';

const router = Router();

router.route('/login')
  .post(authController.logIn)
  .all(methodNotAllowed(['POST']));

router.route('/logout')
  .post(requireAdmin, authController.logOut)
  .all(methodNotAllowed(['POST']));

router.route('/password')
  .put(requireAdmin, authController.changePassword)
  .all(methodNotAllowed(['PUT']));

router.route('/me')
  .get(requireAdmin, authController.getCurrentAdmin)
  .all(methodNotAllowed(['GET']));

export default router;
