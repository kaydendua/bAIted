/**
 * Generate a random 6-character alphanumeric lobby code
 */
export function generateLobbyCode(): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}
