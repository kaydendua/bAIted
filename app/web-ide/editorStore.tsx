let currentCode = "// Code";
let isLocked = false;
const listeners: Set<(code: string) => void> = new Set();
const lockListeners: Set<(locked: boolean) => void> = new Set();

export const editorStore = {
  getCode: () => currentCode,
  
  setCode: (code: string) => {
    currentCode = code;
    listeners.forEach(listener => listener(code));
  },
  
  lock: () => {
    isLocked = true;
    lockListeners.forEach(listener => listener(true));
  },
  
  unlock: () => {
    isLocked = false;
    lockListeners.forEach(listener => listener(false));
  },
  
  isLocked: () => isLocked,
  
  subscribe: (listener: (code: string) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  
  subscribeLock: (listener: (locked: boolean) => void) => {
    lockListeners.add(listener);
    return () => {
      lockListeners.delete(listener);
    };
  }
};