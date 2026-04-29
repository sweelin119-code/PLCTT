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
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);

  const handleTextChange = useCallback(() => {
    if (!quillRef.current) return;
    isInternalChange.current = true;
    const html = quillRef.current.root.innerHTML;
    onChange?.(html === '<p><br></p>' ? '' : html);
    // 延迟重置标志，避免 useEffect 回写
    setTimeout(() => {
      isInternalChange.current = false;
    }, 0);
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
      placeholder,
    });

    quill.on('text-change', handleTextChange);
    quillRef.current = quill;

    // 设置初始值
    if (value) {
      quill.root.innerHTML = value;
    }

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 外部 value 变化时同步到编辑器
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    // 如果是内部触发的 change，跳过回写
    if (isInternalChange.current) return;

    const currentHtml = quill.root.innerHTML;
    const normalizedValue = value || '';
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;

    if (normalizedValue !== normalizedCurrent) {
      quill.root.innerHTML = normalizedValue || '';
    }
  }, [value]);

  return (
    <div>
      <div ref={editorRef} style={{ height }} />
    </div>
  );
};

export default RichTextEditor;
