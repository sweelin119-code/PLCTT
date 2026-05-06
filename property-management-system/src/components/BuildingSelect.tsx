import React, { useState } from 'react';
import { TreeSelect } from 'antd';

interface BuildingNode {
  value: string;
  title: string;
  children?: BuildingNode[];
}

interface BuildingSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
}

// 模拟楼栋数据
const mockBuildings: BuildingNode[] = [
  {
    value: 'building:1',
    title: '1栋',
    children: [
      { value: 'unit:1-1', title: '1单元' },
      { value: 'unit:1-2', title: '2单元' },
      { value: 'unit:1-3', title: '3单元' },
    ],
  },
  {
    value: 'building:2',
    title: '2栋',
    children: [
      { value: 'unit:2-1', title: '1单元' },
      { value: 'unit:2-2', title: '2单元' },
    ],
  },
  {
    value: 'building:3',
    title: '3栋',
    children: [
      { value: 'unit:3-1', title: '1单元' },
      { value: 'unit:3-2', title: '2单元' },
      { value: 'unit:3-3', title: '3单元' },
    ],
  },
  {
    value: 'building:5',
    title: '5栋',
    children: [
      { value: 'unit:5-1', title: '1单元' },
      { value: 'unit:5-2', title: '2单元' },
    ],
  },
];

const BuildingSelect: React.FC<BuildingSelectProps> = ({
  value,
  onChange,
  placeholder = '选择楼栋/单元',
  style,
  allowClear = true,
}) => {
  const [treeData] = useState<BuildingNode[]>(mockBuildings);

  return (
    <TreeSelect
      value={value}
      onChange={onChange}
      treeData={treeData}
      placeholder={placeholder}
      style={style}
      allowClear={allowClear}
      treeDefaultExpandAll
      showSearch
      treeNodeFilterProp="title"
    />
  );
};

export default BuildingSelect;
