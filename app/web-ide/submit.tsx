import { editorStore } from "./editorStore";

export function submitCode(): string {
  // Lock the editor
  editorStore.lock();
  
  // Get the current code
  const code = editorStore.getCode();
  
  // Return the code
  return code;
}

export function unlockEditor(): void {
  editorStore.unlock();
}