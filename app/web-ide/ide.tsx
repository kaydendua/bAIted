"use client";

import React, { useState } from "react";
import CodeMirror, { oneDark } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";

export default function Editor() {
  const [code, setCode] = useState("// Code");

  const requestCode = () => {
    return code;
  }
  
  const updateCode = (updatedCode : string) => {
    setCode(updatedCode);
  }

  return (
    <CodeMirror
      value={code}
      height="300px"
      extensions={[python(), indentUnit.of("    ")]}
      theme={oneDark}
      onChange={(value) => setCode(value)}
    />
  );
}
