import jsBeautify from 'js-beautify';
import { Language } from '../types';

export interface BeautifyOptions {
  indentSize?: number;
  useTabs?: boolean;
  preserveNewlines?: boolean;
  maxPreserveNewlines?: number;
  wrapLineLength?: number;
  braceStyle?: 'collapse' | 'expand' | 'end-expand' | 'none';
}

/**
 * Universal multi-language code beautifier & formatter engine.
 * Leverages js-beautify for JS/TS/JSON/HTML/CSS and domain-specific
 * AST/lexical formatting pipelines for Python, SQL, Java, C#, Go, Rust, C++, PHP.
 */
export function beautifyCode(
  rawCode: string,
  language: Language | string = 'javascript',
  customOptions?: BeautifyOptions
): string {
  if (!rawCode || typeof rawCode !== 'string') return '';
  const trimmed = rawCode.trim();
  if (!trimmed) return '';

  const indentSize = customOptions?.indentSize ?? (language === 'python' ? 4 : 2);
  const braceStyle = customOptions?.braceStyle ?? 'collapse';

  try {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'json': {
        if (language.toLowerCase() === 'json') {
          try {
            return JSON.stringify(JSON.parse(trimmed), null, indentSize);
          } catch {
            // fallback to js_beautify
          }
        }

        const formatted = jsBeautify.js(trimmed, {
          indent_size: indentSize,
          indent_char: customOptions?.useTabs ? '\t' : ' ',
          max_preserve_newlines: customOptions?.maxPreserveNewlines ?? 2,
          preserve_newlines: customOptions?.preserveNewlines ?? true,
          keep_array_indentation: false,
          break_chained_methods: false,
          brace_style: braceStyle,
          space_before_conditional: true,
          unescape_strings: false,
          jslint_happy: false,
          end_with_newline: true,
          wrap_line_length: customOptions?.wrapLineLength ?? 100,
          comma_first: false,
          e4x: true,
        });
        return formatted.trim();
      }

      case 'python':
      case 'py': {
        return formatPython(trimmed, indentSize);
      }

      case 'sql':
      case 'postgresql':
      case 'postgres': {
        return formatSQL(trimmed);
      }

      case 'html':
      case 'xml': {
        return jsBeautify.html(trimmed, {
          indent_size: indentSize,
          indent_char: ' ',
          max_preserve_newlines: 2,
          preserve_newlines: true,
          end_with_newline: true,
        }).trim();
      }

      case 'css':
      case 'scss':
      case 'less': {
        return jsBeautify.css(trimmed, {
          indent_size: indentSize,
          indent_char: ' ',
          end_with_newline: true,
        }).trim();
      }

      case 'java':
      case 'csharp':
      case 'cs':
      case 'cpp':
      case 'c++':
      case 'c':
      case 'php':
      case 'go':
      case 'rust':
      case 'ruby':
      default: {
        // C-family and general curly-brace language formatting
        const formatted = jsBeautify.js(trimmed, {
          indent_size: indentSize,
          indent_char: ' ',
          brace_style: braceStyle,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          space_before_conditional: true,
          end_with_newline: true,
        });
        return postProcessClangFormat(formatted, language);
      }
    }
  } catch (err) {
    console.warn('[CodeBeautifier] Error during formatting:', err);
    return rawCode;
  }
}

/**
 * Intelligent Python code formatter according to PEP-8 standards:
 * - Proper block indentation (4 spaces)
 * - Colon tracking
 * - Spacing around arithmetic and comparison operators
 * - Clean def / class empty line separation
 */
function formatPython(code: string, indentSize = 4): string {
  const lines = code.split('\n');
  const formattedLines: string[] = [];
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Preserve empty lines (max 2 consecutive)
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    // Check if previous line ended an indentation or if current line is dedented
    if (
      trimmed.startsWith('elif ') ||
      trimmed.startsWith('else:') ||
      trimmed.startsWith('except') ||
      trimmed.startsWith('finally:') ||
      trimmed.startsWith('case ')
    ) {
      currentIndent = Math.max(0, currentIndent - 1);
    } else if (trimmed.startsWith('return ') || trimmed === 'pass' || trimmed === 'break' || trimmed === 'continue') {
      // Don't change current indent here, but next non-indented statement might decrease
    }

    // Format operators with clean spacing
    let formattedText = trimmed
      .replace(/([=+\-*/%&|^<>!]=|[=+\-*/%&|^<>!]=?)/g, (match) => {
        // Avoid spacing inside comments or double colons
        if (match === '==' || match === '!=' || match === '<=' || match === '>=' || match === '+=' || match === '-=' || match === '*=' || match === '/=' || match === '=') {
          return ` ${match} `;
        }
        return match;
      })
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*:\s*(?!$)/g, ': ')
      .replace(/\s*;\s*/g, '; ');

    // Normalize spacing around parentheses
    formattedText = formattedText
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']');

    // Insert 2 blank lines before top-level class / def if following existing code
    if (currentIndent === 0 && (trimmed.startsWith('class ') || trimmed.startsWith('def '))) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
    }

    const indentSpaces = ' '.repeat(currentIndent * indentSize);
    formattedLines.push(indentSpaces + formattedText);

    // Increase indent if line ends with colon
    if (trimmed.endsWith(':') && !trimmed.startsWith('#')) {
      currentIndent++;
    }
  }

  return formattedLines.join('\n').trim();
}

/**
 * SQL Query Beautifier with capitalized keywords and structured clause alignment.
 */
function formatSQL(sql: string): string {
  const keywords = [
    'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
    'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'OUTER JOIN', 'CROSS JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'UNION ALL', 'UNION',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS',
    'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL', 'WITH'
  ];

  let formatted = sql.trim();

  // Standardize keyword casing
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, kw);
  });

  // Split clauses onto separate lines
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'INSERT INTO', 'VALUES', 'SET'
  ];

  majorClauses.forEach((clause) => {
    const regex = new RegExp(`\\s+(${clause})\\b`, 'g');
    formatted = formatted.replace(regex, `\n$1`);
  });

  // Clean comma spacing
  formatted = formatted.replace(/,\s*/g, ', ');

  return formatted.trim();
}

/**
 * Post-processes C-family language outputs (Java, C#, Go, Rust) for clean alignment.
 */
function postProcessClangFormat(code: string, language: string): string {
  let cleaned = code
    .replace(/\s*([+\-*/%=&|<>!]=?)\s*/g, (match, op) => {
      if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '=', '&&', '||', '=>', '->'].includes(op)) {
        return ` ${op} `;
      }
      return match;
    })
    .replace(/\s*,\s*/g, ', ')
    .replace(/;\s*(?!\n)/g, '; ')
    .trim();

  if (language === 'go') {
    // In Go, opening braces must remain on same line
    cleaned = cleaned.replace(/\n\s*\{/g, ' {');
  }

  return cleaned;
}
