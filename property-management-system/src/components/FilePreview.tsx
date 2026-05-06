import React from 'react';
import { Modal, Image } from 'antd';

interface FilePreviewProps {
  visible: boolean;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  onClose: () => void;
}

/**
 * 文件在线预览组件
 * - PDF: 使用 iframe 嵌入
 * - Word/Excel: 使用 Microsoft Office Online Viewer
 * - 图片: 使用 Ant Design Image 弹窗
 * - 其他: 提示无法预览
 */
const FilePreview: React.FC<FilePreviewProps> = ({
  visible,
  fileUrl,
  fileName,
  fileType,
  onClose,
}) => {
  // 图片预览 - 直接使用 Ant Design Image
  if (fileType === 'image') {
    return (
      <div style={{ display: visible ? 'block' : 'none' }}>
        {visible && (
          <Image
            src={fileUrl}
            alt={fileName}
            style={{ display: 'none' }}
            preview={{
              visible,
              src: fileUrl,
              onVisibleChange: (v) => { if (!v) onClose(); },
            }}
          />
        )}
      </div>
    );
  }

  // PDF 预览 - 使用 iframe
  if (fileType === 'pdf') {
    return (
      <Modal
        title={fileName}
        open={visible}
        onCancel={onClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(100vh - 120px)', padding: 0 }}
      >
        <iframe
          src={`${fileUrl}#toolbar=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={fileName}
        />
      </Modal>
    );
  }

  // Word/Excel - 使用 Microsoft Office Online Viewer
  if (fileType === 'word' || fileType === 'excel') {
    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    return (
      <Modal
        title={fileName}
        open={visible}
        onCancel={onClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(100vh - 120px)', padding: 0 }}
      >
        <iframe
          src={officeViewerUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={fileName}
        />
      </Modal>
    );
  }

  // 其他类型 - 提示无法预览
  return (
    <Modal
      title={fileName}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>📄</p>
        <p>该文件类型暂不支持在线预览</p>
        <p style={{ color: '#999', fontSize: 12 }}>文件名：{fileName}</p>
      </div>
    </Modal>
  );
};

/**
 * 在新窗口打开文件预览
 */
export function openFilePreview(fileUrl: string, fileName: string, fileType: string): void {
  const type = fileType as 'pdf' | 'word' | 'excel' | 'image' | 'other';

  // 图片直接打开
  if (type === 'image') {
    window.open(fileUrl, '_blank');
    return;
  }

  // PDF 直接打开（浏览器原生支持）
  if (type === 'pdf') {
    window.open(fileUrl, '_blank');
    return;
  }

  // Word/Excel 使用 Office Online Viewer
  if (type === 'word' || type === 'excel') {
    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    window.open(officeViewerUrl, '_blank');
    return;
  }

  // 其他类型尝试直接打开
  window.open(fileUrl, '_blank');
}

export default FilePreview;
