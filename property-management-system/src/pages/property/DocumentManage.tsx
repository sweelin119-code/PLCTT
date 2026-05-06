import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, Tree,
  Space, Typography, message, Popconfirm, Upload, Tooltip, Empty,
} from 'antd';
import {
  DeleteOutlined, DownloadOutlined, EyeOutlined,
  FolderOutlined, FileOutlined, UploadOutlined,
  FilePdfOutlined, FileWordOutlined, FileExcelOutlined,
  FileImageOutlined, FolderAddOutlined, SearchOutlined,
} from '@ant-design/icons';
import {
  getDirectories, createDirectory,
  getFiles, uploadFile, deleteFile,
  type FileDirectory, type InternalFile,
} from '../../services/dailyService';
import FilePreview from '../../components/FilePreview';

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;

const fileTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pdf: { color: '#FF3B30', icon: <FilePdfOutlined /> },
  word: { color: '#007AFF', icon: <FileWordOutlined /> },
  excel: { color: '#34C759', icon: <FileExcelOutlined /> },
  image: { color: '#AF52DE', icon: <FileImageOutlined /> },
  other: { color: '#999', icon: <FileOutlined /> },
};

/** 根据文件扩展名推断文件类型 */
function detectFileType(fileName: string): 'pdf' | 'word' | 'excel' | 'image' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'image';
  return 'other';
}

const DocumentManage: React.FC = () => {
  const [directories, setDirectories] = useState<FileDirectory[]>([]);
  const [files, setFiles] = useState<InternalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [selectedDirName, setSelectedDirName] = useState<string>('全部文件');
  const [dirModalVisible, setDirModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dirForm] = Form.useForm();
  const [uploadForm] = Form.useForm();

  // 文件预览状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<InternalFile | null>(null);

  // 存储已选择的文件对象（用于自动提取文件名和类型）
  const selectedFileRef = useRef<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dirs, fileData] = await Promise.all([
        getDirectories(),
        getFiles(selectedDir || undefined),
      ]);
      setDirectories(dirs);
      setFiles(fileData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDir]);

  // 构建树形结构
  const buildTreeData = (parentId: string | null): any[] => {
    return directories
      .filter(d => d.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(dir => ({
        key: dir.id,
        title: dir.name,
        icon: <FolderOutlined />,
        children: buildTreeData(dir.id),
        isLeaf: !directories.some(d => d.parentId === dir.id),
      }));
  };

  const treeData = [
    {
      key: 'all',
      title: '全部文件',
      icon: <FolderOutlined />,
      children: buildTreeData(null),
    },
  ];

  const handleTreeSelect = (keys: React.Key[]) => {
    const key = keys[0] as string;
    if (key === 'all') {
      setSelectedDir(null);
      setSelectedDirName('全部文件');
    } else {
      setSelectedDir(key);
      const dir = directories.find(d => d.id === key);
      setSelectedDirName(dir?.name || '未知目录');
    }
  };

  const handleAddDir = () => {
    dirForm.resetFields();
    dirForm.setFieldsValue({ parentId: selectedDir });
    setDirModalVisible(true);
  };

  const handleSaveDir = async () => {
    const values = await dirForm.validateFields();
    await createDirectory(values);
    message.success('目录已创建');
    setDirModalVisible(false);
    fetchData();
  };

  const handleUpload = () => {
    uploadForm.resetFields();
    selectedFileRef.current = null;
    // 默认选择当前选中的目录
    uploadForm.setFieldsValue({ directoryId: selectedDir });
    setUploadModalVisible(true);
  };

  const handleSaveFile = async () => {
    const values = await uploadForm.validateFields();
    // 如果用户选择了文件但未自动填充，尝试从 ref 中获取
    if (!values.name && selectedFileRef.current) {
      values.name = selectedFileRef.current.name;
    }
    if (!values.fileType && selectedFileRef.current) {
      values.fileType = detectFileType(selectedFileRef.current.name);
    }
    // 如果仍然没有文件名，提示用户选择文件
    if (!values.name) {
      message.warning('请先选择要上传的文件');
      return;
    }
    await uploadFile(values);
    message.success('文件已上传');
    setUploadModalVisible(false);
    fetchData();
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFile(id);
    message.success('文件已删除');
    fetchData();
  };

  // 打开文件预览
  const handlePreview = (record: InternalFile) => {
    setPreviewFile(record);
    setPreviewVisible(true);
  };

  const filteredFiles = searchText
    ? files.filter(f => f.name.toLowerCase().includes(searchText.toLowerCase()))
    : files;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: InternalFile) => {
        const cfg = fileTypeConfig[record.fileType] || fileTypeConfig.other;
        return (
          <Space>
            <span style={{ color: cfg.color, fontSize: 18 }}>{cfg.icon}</span>
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 80,
      render: (type: string) => {
        const cfg = fileTypeConfig[type] || fileTypeConfig.other;
        return <Tag color={cfg.color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传人',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 80,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 150,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: InternalFile) => (
        <Space>
          <Tooltip title="预览">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button type="link" size="small" icon={<DownloadOutlined />} />
          </Tooltip>
          <Popconfirm title="确定删除此文件？" onConfirm={() => handleDeleteFile(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>内部文件管理</Title>
        <Space>
          <Button icon={<FolderAddOutlined />} onClick={handleAddDir}>
            新建目录
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={handleUpload}>
            上传文件
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧目录树 */}
        <Card size="small" style={{ width: 260, minHeight: 500, flexShrink: 0 }}>
          <DirectoryTree
            defaultExpandAll
            treeData={treeData}
            onSelect={handleTreeSelect}
            icon={null}
          />
        </Card>

        {/* 右侧文件列表 */}
        <Card
          size="small"
          style={{ flex: 1, minHeight: 500 }}
          title={
            <Space>
              <FolderOutlined />
              <span>{selectedDirName}</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                （{filteredFiles.length} 个文件）
              </Text>
            </Space>
          }
          extra={
            <Input
              placeholder="搜索文件名..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              size="small"
              allowClear
            />
          }
        >
          {filteredFiles.length > 0 ? (
            <Table
              dataSource={filteredFiles}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          ) : (
            <Empty description="暂无文件" style={{ padding: '60px 0' }} />
          )}
        </Card>
      </div>

      {/* 新建目录弹窗 */}
      <Modal
        title="新建目录"
        open={dirModalVisible}
        onOk={handleSaveDir}
        onCancel={() => { setDirModalVisible(false); dirForm.resetFields(); }}
      >
        <Form form={dirForm} layout="vertical">
          <Form.Item name="name" label="目录名称" rules={[{ required: true, message: '请输入目录名称' }]}>
            <Input placeholder="例如：人事制度" />
          </Form.Item>
          <Form.Item name="parentId" label="上级目录">
            <Select
              allowClear
              placeholder="选择上级目录（留空为根目录）"
              options={directories.map(d => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号">
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传文件弹窗 - 简化版 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onOk={handleSaveFile}
        onCancel={() => { setUploadModalVisible(false); uploadForm.resetFields(); }}
      >
        <Form form={uploadForm} layout="vertical">
          {/* 存放目录 - 默认当前选中目录 */}
          <Form.Item name="directoryId" label="存放目录">
            <Select
              placeholder="选择存放目录"
              options={directories.map(d => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>

          {/* 选择文件 - 自动提取文件名和类型 */}
          <Form.Item label="选择文件" required>
            <Upload
              beforeUpload={(file) => {
                // 自动填充文件名和文件类型
                selectedFileRef.current = file;
                uploadForm.setFieldsValue({
                  name: file.name,
                  fileType: detectFileType(file.name),
                  fileSize: file.size,
                });
                return false; // 阻止自动上传
              }}
              maxCount={1}
              onRemove={() => {
                selectedFileRef.current = null;
                uploadForm.setFieldsValue({
                  name: undefined,
                  fileType: undefined,
                  fileSize: undefined,
                });
              }}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>

          {/* 自动提取的文件名（只读展示） */}
          <Form.Item name="name" label="文件名">
            <Input placeholder="选择文件后自动填充" readOnly />
          </Form.Item>

          {/* 自动提取的文件类型（只读展示） */}
          <Form.Item name="fileType" label="文件类型">
            <Input placeholder="选择文件后自动识别" readOnly />
          </Form.Item>

          {/* 文件大小（隐藏字段，仅用于提交） */}
          <Form.Item name="fileSize" hidden>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 文件预览弹窗 */}
      {previewFile && (
        <FilePreview
          visible={previewVisible}
          fileUrl={previewFile.fileUrl}
          fileName={previewFile.name}
          fileType={previewFile.fileType}
          onClose={() => setPreviewVisible(false)}
        />
      )}
    </div>
  );
};

export default DocumentManage;
