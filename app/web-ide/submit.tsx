import { editorStore } from "./editorStore";

export function submitCode(): string {
  // Get the current code first
  const code = editorStore.getCode();
  
  // Then lock the editor
  editorStore.lock();
  
  // Return the code
  return code;
}

export function unlockEditor(): void {
  editorStore.unlock();
}