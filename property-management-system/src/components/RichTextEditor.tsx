import React, { useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['link'],
  ['clean'],
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '请输入正文内容...',
  height = 400,
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);
  const initialized = useRef(false);

  const handleTextChange = useCallback(() => {
    if (!quillRef.current) return;
    isInternalChange.current = true;
    const html = quillRef.current.root.innerHTML;
    onChange?.(html === '<p><br></p>' ? '' : html);
    setTimeout(() => {
      isInternalChange.current = false;
    }, 0);
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || initialized.current) return;
    initialized.current = true;

    // 确保容器有明确的 id 用于 toolbar 绑定
    const container = editorRef.current;
    const quill = new Quill(container, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
      placeholder,
    });

    quill.on('text-change', handleTextChange);
    quillRef.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部 value 变化时同步到编辑器
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (isInternalChange.current) return;

    const currentHtml = quill.root.innerHTML;
    const normalizedValue = value || '';
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;

    if (normalizedValue !== normalizedCurrent) {
      quill.root.innerHTML = normalizedValue || '';
    }
  }, [value]);

  return (
    <div ref={editorContainerRef}>
      <div ref={editorRef} style={{ height }} />
    </div>
  );
};

export default RichTextEditor;
