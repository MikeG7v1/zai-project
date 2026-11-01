export function toLoginDto({ accessToken, expiresInSeconds, username }) {
  return { accessToken, tokenType: 'Bearer', expiresIn: expiresInSeconds, username };
}

export function toCurrentAdminDto(session) {
  return { username: session.username };
}
