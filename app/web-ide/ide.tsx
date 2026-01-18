"use client";

import React, { useState, useEffect } from "react";
import CodeMirror, { oneDark } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { editorStore } from "./editorStore";

interface EditorProps {
  isAI?: boolean;
}

export default function Editor({ isAI = false }: EditorProps) {
  const [code, setCode] = useState(editorStore.getCode());
  const [locked, setLocked] = useState(editorStore.isLocked());

  // Subscribe to code changes from external sources
  useEffect(() => {
    const unsubscribe = editorStore.subscribe((newCode) => {
      setCode(newCode);
    });
    return unsubscribe;
  }, []);

  // Subscribe to lock state changes
  useEffect(() => {
    const unsubscribe = editorStore.subscribeLock((isLocked) => {
      setLocked(isLocked);
    });
    return unsubscribe;
  }, []);

  // Lock editor for AI players
  useEffect(() => {
    if (isAI) {
      editorStore.lock();
    }
  }, [isAI]);

  const handleChange = (value: string) => {
    if (!locked) {
      setCode(value);
      editorStore.setCode(value);
    }
  };

  return (
    <CodeMirror
      value={code}
      height="100%"
      extensions={[python(), indentUnit.of("    ")]}
      theme={oneDark}
      onChange={handleChange}
      editable={!locked}
      readOnly={locked}
      className="h-full"
    />
  );
}