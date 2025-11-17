import {useCallback} from "react";
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
                        onChange,
                      }: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [ref, {width, height}] = useElementSize<HTMLDivElement>();
  const handleMount: OnMount = useCallback((editor, monaco) => {
    registerRhai(monaco, CHART_API);
    // ensure the model is tagged as Rhai
    const model = editor.getModel();
    if (model) monaco.editor.setModelLanguage(model, "rhai");
  }, []);

  return (
      <div ref={ref} style={{width: "100%", height: "100%", minHeight: 0}}>
        <div style={{width, height}}>
          <MonacoEditor
              height="100%"
              defaultLanguage="rhai"
              value={value}
              onChange={(v) => onChange(v ?? "")}
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
  );
}

export default ScriptEditor;
