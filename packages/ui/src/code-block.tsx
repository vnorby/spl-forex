"use client";

import type { CSSProperties } from "react";
import { useMemo, useSyncExternalStore } from "react";
import {
  Prism as SyntaxHighlighter,
  type SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { cn } from "./utils";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export interface CodeBlockProps {
  code: string;
  language?: string;
  style?: SyntaxHighlighterProps["style"];
  showLineNumbers?: boolean;
  customStyle?: CSSProperties;
  className?: string;
  lineNumberStyle?: CSSProperties;
  wrapLongLines?: boolean;
}

function getCodeLines(code: string) {
  const normalized = code.endsWith("\n") ? code.slice(0, -1) : code;
  return normalized.split("\n");
}

function CodeBlockFallback({
  code,
  showLineNumbers,
  customStyle,
  className,
}: Pick<CodeBlockProps, "code" | "showLineNumbers" | "customStyle" | "className">) {
  const lines = useMemo(() => getCodeLines(code), [code]);

  return (
    <pre
      className={cn(
        "overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs leading-5 text-[var(--color-text)]",
        className,
      )}
      style={{ margin: 0, ...customStyle }}
    >
      <code>
        {showLineNumbers
          ? lines.map((line, index) => (
              <span key={index} className="block">
                <span className="inline-block min-w-[2.25em] pr-4 text-right text-[var(--color-text-muted)] select-none">
                  {index + 1}
                </span>
                <span className="whitespace-pre">{line.length > 0 ? line : "\u00A0"}</span>
              </span>
            ))
          : code}
      </code>
    </pre>
  );
}

export function CodeBlock({
  code,
  language = "typescript",
  style,
  showLineNumbers = false,
  customStyle,
  className,
  lineNumberStyle,
  wrapLongLines,
}: CodeBlockProps) {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!hasMounted || !style) {
    return (
      <CodeBlockFallback
        code={code}
        showLineNumbers={showLineNumbers}
        customStyle={customStyle}
        className={className}
      />
    );
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={style}
      customStyle={customStyle}
      showLineNumbers={showLineNumbers}
      className={className}
      lineNumberStyle={lineNumberStyle}
      wrapLongLines={wrapLongLines}
    >
      {code}
    </SyntaxHighlighter>
  );
}

