export function parseLoginInput(body) {
  return { username: body.username.trim(), password: body.password };
}

export function parsePasswordChangeInput(body) {
  return { currentPassword: body.currentPassword, newPassword: body.newPassword };
}
