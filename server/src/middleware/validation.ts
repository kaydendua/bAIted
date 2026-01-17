export function validateLobbyCode(code: string): boolean {
  // Lobby codes should be 6 characters, alphanumeric
  const lobbyCodeRegex = /^[A-Z0-9]{6}$/;
  return lobbyCodeRegex.test(code);
}

export function validatePlayerName(name: string): boolean {
  // Player names should be 1-20 characters
  return name.length > 0 && name.length <= 20;
}

export function sanitizePlayerName(name: string): string {
  // Remove special characters and trim
  return name.trim().replace(/[^\w\s-]/g, '').substring(0, 20);
}
