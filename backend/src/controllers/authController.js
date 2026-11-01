import { parseLoginInput, parsePasswordChangeInput } from '../parsers/authParser.js';
import * as authService from '../services/authService.js';
import { validateLoginInput, validatePasswordChangeInput } from '../validators/authValidator.js';
import { toCurrentAdminDto, toLoginDto } from '../views/authView.js';

export async function logIn(req, res) {
  validateLoginInput(req.body);
  const login = await authService.logIn(parseLoginInput(req.body));
  res.set('Cache-Control', 'no-store');
  res.json(toLoginDto(login));
}

export async function logOut(req, res) {
  await authService.logOut(req.adminSession);
  res.status(204).end();
}

export async function changePassword(req, res) {
  validatePasswordChangeInput(req.body);
  await authService.changePassword(req.adminSession, parsePasswordChangeInput(req.body));
  res.status(204).end();
}

export function getCurrentAdmin(req, res) {
  res.json(toCurrentAdminDto(req.adminSession));
}
