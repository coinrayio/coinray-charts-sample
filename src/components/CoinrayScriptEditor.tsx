import {useCallback, useState} from "react";
import MonacoEditor, {type OnMount} from "@monaco-editor/react";
import {registerRhai} from "../rhaiLanguage";
import {useElementSize} from "../hooks/useResize.ts";

// Example: surface your chart API for completions
const CHART_API = [
  "plot",
  "setSeries",
  "setIndicator",
  "setTimeframe",
  "print",
];

function ScriptEditor({
                        value,
                        title = "Untitled script",
                        onRun = () => {
                        },
                      }: {
  value: string;
  title?: string;
  onRun?: (script : string) => void;
}) {
  const [ref, {width, height}] = useElementSize<HTMLDivElement>();
  const [script, updateScript] = useState(value);
  const handleMount: OnMount = useCallback((editor, monaco) => {
    registerRhai(monaco, CHART_API);
    // ensure the model is tagged as Rhai
    const model = editor.getModel();
    if (model) monaco.editor.setModelLanguage(model, "rhai");
  }, []);


  return (
      <div ref={ref} style={{width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column"}}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 8px",
          borderBottom: "1px solid #ddd",
          userSelect: "none"
        }}>
          <div style={{
            flex: "1",
            display: "flex",
            alignItems: "center",
            fontSize: 14,
            fontWeight: "bold",
            color: "#333"
          }}>
            {title} <span style={{fontSize: 10, marginLeft: 4}}>▼</span>
          </div>
          <button onClick={() => {
            if (onRun) onRun(script)
          }} style={{
            marginLeft: 8,
            padding: "4px 8px",
            fontSize: 13,
            cursor: "pointer",
            background: "none",
            border: "1px solid #ccc",
            borderRadius: 3
          }}>▶ Run
          </button>
          <button style={{
            marginLeft: 8,
            padding: "4px 8px",
            fontSize: 16,
            cursor: "pointer",
            background: "none",
            border: "1px solid #ccc",
            borderRadius: 3,
            lineHeight: 1
          }}>⋯
          </button>
        </div>
        <div style={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column"}}>
          <div style={{width, height}}>
            <MonacoEditor
                height="100%"
                defaultLanguage="rhai"
                value={value}
                onChange={(v) => updateScript(v ?? "")}
                onMount={handleMount}
                theme="vs-light"
                options={{
                  automaticLayout: true,       // resizes with container
                  minimap: {enabled: false},
                  wordWrap: "off",
                  fontSize: 13,
                  tabSize: 2,
                  bracketPairColorization: {enabled: true},
                  renderWhitespace: "selection",
                  quickSuggestions: true,
                  inlineSuggest: {enabled: true},
                }}
            />
          </div>
        </div>
      </div>
  );
}

export default ScriptEditor;
