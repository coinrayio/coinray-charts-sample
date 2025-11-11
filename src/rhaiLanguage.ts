// rhaiLanguage.ts
import * as monaco from "monaco-editor";

export function registerRhai(monacoNs: typeof monaco, chartApiCompletions: string[] = []) {
  // 1) Register language id
  monacoNs.languages.register({ id: "rhai" });

  // 2) Basic syntax highlighting (expand as needed)
  monacoNs.languages.setMonarchTokensProvider("rhai", {
    tokenizer: {
      root: [
        [/\b(let|fn|if|else|while|for|return|true|false|null)\b/, "keyword"],
        [/\/\/.*$/, "comment"],
        [/"([^"\\]|\\.)*"?/, "string"],
        [/'([^'\\]|\\.)*'?/, "string"],
        [/\b\d+(\.\d+)?\b/, "number"],
        [/[{}()\[\]]/, "@brackets"],
        [/[=+\-*/%!?<>&|^]+/, "operator"],
        [/[A-Za-z_]\w*/, "identifier"],
      ],
    },
    brackets: [
      { open: "{", close: "}", token: "delimiter.curly" },
      { open: "[", close: "]", token: "delimiter.bracket" },
      { open: "(", close: ")", token: "delimiter.parenthesis" },
    ],
  });

  // 3) Simple completions: Rhai keywords + your chart API
  const keywordLabels = ["let","fn","if","else","while","for","return","true","false","null"];
  monacoNs.languages.registerCompletionItemProvider("rhai", {
    triggerCharacters: [".", "_"],
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        ...keywordLabels.map(label => ({
          label,
          kind: monacoNs.languages.CompletionItemKind.Keyword,
          insertText: label,
        })),
        ...chartApiCompletions.map(fn => ({
          label: fn,
          kind: monacoNs.languages.CompletionItemKind.Function,
          insertText: fn + "($0);",
          insertTextRules: monacoNs.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Chart API",
        })),
      ];
      return { suggestions };
    },
  });
}
