'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import { toRichTextHtml } from '@/lib/rich-text';

const getText = (value) => (typeof value === 'string' ? value : '');
const HAS_HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toEditorHtml = (value) => {
  const source = getText(value).replace(/\r\n?/g, '\n').trim();
  if (!source) return '';
  if (HAS_HTML_TAG_PATTERN.test(source)) return source;
  return toRichTextHtml(source, { multiline: true }) || escapeHtml(source).replace(/\n/g, '<br />');
};

export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  placeholder,
  minHeight = 120,
  required = false,
}) {
  const generatedId = useId();
  const editorId = id || `rich-editor-${generatedId}`;
  const editorRef = useRef(null);
  const plainId = `${editorId}-plain`;
  const initialHtml = useMemo(() => toEditorHtml(value), [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== initialHtml) {
      editor.innerHTML = initialHtml;
    }
    editor.dataset.empty = initialHtml ? 'false' : 'true';
  }, [initialHtml]);

  const syncValue = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = getText(editor.innerHTML).trim();
    editor.dataset.empty = html ? 'false' : 'true';
    onChange(html);
  };

  const runCommand = (command, commandValue) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const handleInsertLink = () => {
    const selection = window.getSelection();
    const selectedText = getText(selection?.toString()).trim();
    const rawUrl = window.prompt('Введите ссылку (https://...)');
    const url = getText(rawUrl).trim();
    if (!url) return;
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    if (selectedText) {
      runCommand('createLink', normalizedUrl);
      return;
    }

    runCommand('insertHTML', `<a href="${escapeHtml(normalizedUrl)}">${escapeHtml(normalizedUrl)}</a>`);
  };

  return (
    <label className="form-field full">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input id={plainId} type="hidden" value={getText(value)} readOnly />
      <div className="rich-editor" data-editor-id={editorId}>
        <div className="rich-editor-toolbar">
          <button
            className="rich-editor-btn rich-editor-btn-icon"
            type="button"
            onClick={() => runCommand('bold')}
            aria-label="Жирный"
            title="Жирный"
          >
            Ж
          </button>
          <button
            className="rich-editor-btn rich-editor-btn-icon"
            type="button"
            onClick={() => runCommand('italic')}
            aria-label="Курсив"
            title="Курсив"
          >
            К
          </button>
          <button
            className="rich-editor-btn rich-editor-btn-icon"
            type="button"
            onClick={() => runCommand('underline')}
            aria-label="Подчеркнутый"
            title="Подчеркнутый"
          >
            Ч
          </button>
          <button
            className="rich-editor-btn"
            type="button"
            onClick={() => runCommand('insertUnorderedList')}
            aria-label="Маркированный список"
            title="Маркированный список"
          >
            Список
          </button>
          <button
            className="rich-editor-btn"
            type="button"
            onClick={() => runCommand('insertOrderedList')}
            aria-label="Нумерованный список"
            title="Нумерованный список"
          >
            Нумер.
          </button>
          <button
            className="rich-editor-btn"
            type="button"
            onClick={handleInsertLink}
            aria-label="Вставить ссылку"
            title="Вставить ссылку"
          >
            Ссылка
          </button>
          <button
            className="rich-editor-btn rich-editor-btn-clear"
            type="button"
            onClick={() => {
              runCommand('removeFormat');
              runCommand('unlink');
            }}
            aria-label="Очистить форматирование"
            title="Очистить форматирование"
          >
            Очистить
          </button>
        </div>
        <p className="rich-editor-hint">Введите текст в поле ниже и применяйте форматирование кнопками сверху.</p>
        <div
          id={editorId}
          ref={editorRef}
          className="rich-editor-surface"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          data-placeholder={placeholder || ''}
          data-empty={initialHtml ? 'false' : 'true'}
          style={{ minHeight: `${minHeight}px` }}
          onInput={syncValue}
          onBlur={syncValue}
        />
      </div>
    </label>
  );
}
