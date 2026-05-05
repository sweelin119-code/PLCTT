// 资产管理服务层 - 含Mock数据
import type {
  Building,
  BuildingUnit,
  House,
  Owner,
  HouseOwner,
  OwnerChangeLog,
  OwnerType,
  ParkingSpace,
  AssetStatistics,
  BuildingStatistics,
  DataSource,
  OwnerAccount,
  AccountTransaction,
} from './assetTypes';

// ===== 模拟延迟 =====
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== Mock 楼栋数据 =====
let mockBuildings: Building[] = [
  { id: 1, projectId: 20, name: '1栋', aliasName: '桂花苑1号', totalLayers: 18, undergroundLayers: 1, totalUnits: 2, totalElevators: 2, buildYear: 2018, propertyType: 'residence', dataSource: 'manual', sortOrder: 1, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 2, projectId: 20, name: '2栋', aliasName: '桂花苑2号', totalLayers: 18, undergroundLayers: 1, totalUnits: 2, totalElevators: 2, buildYear: 2018, propertyType: 'residence', dataSource: 'manual', sortOrder: 2, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 3, projectId: 20, name: '3栋', aliasName: '桂花苑3号', totalLayers: 11, totalUnits: 1, totalElevators: 2, buildYear: 2019, propertyType: 'residence', dataSource: 'manual', sortOrder: 3, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 4, projectId: 20, name: '4栋', aliasName: '桂花苑4号', totalLayers: 11, totalUnits: 1, totalElevators: 2, buildYear: 2019, propertyType: 'residence', dataSource: 'manual', sortOrder: 4, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 5, projectId: 20, name: '5栋', aliasName: '桂花苑5号', totalLayers: 6, totalUnits: 2, totalElevators: 1, buildYear: 2020, propertyType: 'residence', dataSource: 'manual', sortOrder: 5, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 6, projectId: 20, name: '6栋', aliasName: '桂花苑6号', totalLayers: 6, totalUnits: 2, totalElevators: 1, buildYear: 2020, propertyType: 'residence', dataSource: 'manual', sortOrder: 6, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 7, projectId: 21, name: 'A栋', aliasName: '翠苑A座', totalLayers: 12, undergroundLayers: 1, totalUnits: 2, totalElevators: 2, buildYear: 2016, propertyType: 'residence', dataSource: 'gov_sync', sortOrder: 1, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 8, projectId: 21, name: 'B栋', aliasName: '翠苑B座', totalLayers: 12, undergroundLayers: 1, totalUnits: 2, totalElevators: 2, buildYear: 2016, propertyType: 'residence', dataSource: 'gov_sync', sortOrder: 2, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 9, projectId: 21, name: 'C栋', aliasName: '翠苑C座', totalLayers: 8, totalUnits: 1, totalElevators: 1, buildYear: 2017, propertyType: 'residence', dataSource: 'gov_sync', sortOrder: 3, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 10, projectId: 22, name: '1号楼', aliasName: '阳光城1号', totalLayers: 26, undergroundLayers: 2, totalUnits: 3, totalElevators: 4, buildYear: 2021, propertyType: 'residence', dataSource: 'manual', sortOrder: 1, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 11, projectId: 22, name: '2号楼', aliasName: '阳光城2号', totalLayers: 26, undergroundLayers: 2, totalUnits: 3, totalElevators: 4, buildYear: 2021, propertyType: 'residence', dataSource: 'manual', sortOrder: 2, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 12, projectId: 22, name: '商业楼', aliasName: '阳光城商业中心', totalLayers: 4, totalUnits: 1, totalElevators: 2, buildYear: 2021, propertyType: 'shop', dataSource: 'manual', sortOrder: 3, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
];

// ===== Mock 单元数据 =====
let mockUnits: BuildingUnit[] = [
  { id: 1, buildingId: 1, name: '1单元', totalFloors: 18, totalHouses: 36, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 2, buildingId: 1, name: '2单元', totalFloors: 18, totalHouses: 36, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 3, buildingId: 2, name: '1单元', totalFloors: 18, totalHouses: 36, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 4, buildingId: 2, name: '2单元', totalFloors: 18, totalHouses: 36, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 5, buildingId: 3, name: '1单元', totalFloors: 11, totalHouses: 22, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 6, buildingId: 4, name: '1单元', totalFloors: 11, totalHouses: 22, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 7, buildingId: 5, name: '1单元', totalFloors: 6, totalHouses: 12, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 8, buildingId: 5, name: '2单元', totalFloors: 6, totalHouses: 12, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 9, buildingId: 6, name: '1单元', totalFloors: 6, totalHouses: 12, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 10, buildingId: 6, name: '2单元', totalFloors: 6, totalHouses: 12, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 11, buildingId: 7, name: '1单元', totalFloors: 12, totalHouses: 24, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 12, buildingId: 7, name: '2单元', totalFloors: 12, totalHouses: 24, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 13, buildingId: 8, name: '1单元', totalFloors: 12, totalHouses: 24, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 14, buildingId: 8, name: '2单元', totalFloors: 12, totalHouses: 24, sortOrder: 2, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 15, buildingId: 9, name: '1单元', totalFloors: 8, totalHouses: 16, sortOrder: 1, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
];

// ===== Mock 房屋数据 =====
const generateMockHouses = (): House[] => {
  const houses: House[] = [];
  let id = 1;
  const now = '2024-01-01 08:00:00';

  // 为每个楼栋生成房屋
  const buildingConfigs = [
    { buildingId: 1, unitIds: [1, 2], floors: 18, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 2, unitIds: [3, 4], floors: 18, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 3, unitIds: [5], floors: 11, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 4, unitIds: [6], floors: 11, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 5, unitIds: [7, 8], floors: 6, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 6, unitIds: [9, 10], floors: 6, roomsPerFloor: 2, projectId: 20 },
    { buildingId: 7, unitIds: [11, 12], floors: 12, roomsPerFloor: 2, projectId: 21 },
    { buildingId: 8, unitIds: [13, 14], floors: 12, roomsPerFloor: 2, projectId: 21 },
    { buildingId: 9, unitIds: [15], floors: 8, roomsPerFloor: 2, projectId: 21 },
  ];

  const roomSuffixes = ['01', '02', '03', '04'];
  const orientations = ['南', '南北', '东', '西'];
  const decorations: Array<'rough' | 'simple' | 'standard' | 'luxury'> = ['rough', 'simple', 'standard', 'luxury'];
  const statuses: Array<'vacant' | 'occupied' | 'rented' | 'for_sale' | 'renovating'> = ['vacant', 'occupied', 'occupied', 'occupied', 'rented', 'vacant'];

  for (const config of buildingConfigs) {
    const building = mockBuildings.find(b => b.id === config.buildingId);
    for (const unitId of config.unitIds) {
      const unit = mockUnits.find(u => u.id === unitId);
      for (let floor = 1; floor <= config.floors; floor++) {
        for (let r = 0; r < config.roomsPerFloor; r++) {
          const roomNo = `${String(floor).padStart(2, '0')}${roomSuffixes[r]}`;
          const fullName = `${building?.name || ''}${unit ? unit.name : ''}${roomNo}`;
          houses.push({
            id: id++,
            projectId: config.projectId,
            buildingId: config.buildingId,
            unitId: unitId,
            floor,
            roomNo,
            fullName,
            layout: r % 2 === 0 ? '3室2厅' : '2室2厅',
            area: 80 + Math.floor(Math.random() * 60),
            usableArea: 65 + Math.floor(Math.random() * 45),
            orientation: orientations[Math.floor(Math.random() * orientations.length)],
            decorationStatus: decorations[Math.floor(Math.random() * decorations.length)],
            ownershipStatus: statuses[Math.floor(Math.random() * statuses.length)],
            propertyType: building?.propertyType || 'residence',
            dataSource: config.projectId === 21 ? 'gov_sync' : 'manual',
            sortOrder: 1,
            enabled: true,
            createTime: now,
            updateTime: now,
            buildingName: building?.name || '',
            unitName: unit?.name || '',
          });
        }
      }
    }
  }
  return houses;
};

let mockHouses: House[] = generateMockHouses();

// ===== Mock 业主数据 =====
let mockOwners: Owner[] = [
  { id: 1, projectId: 20, name: '张建国', phone: '13800138001', idCard: '110101198001011234', gender: 'male', birthday: '1980-01-01', nationality: '汉族', nativePlace: '浙江杭州', education: '本科', profession: '教师', tags: ['业委会成员', '党员'], dataSource: 'manual', status: true, createTime: '2024-01-15 10:00:00', updateTime: '2024-01-15 10:00:00' },
  { id: 2, projectId: 20, name: '李秀芳', phone: '13800138002', idCard: '110101198505052345', gender: 'female', birthday: '1985-05-05', nationality: '汉族', nativePlace: '浙江宁波', education: '硕士', profession: '医生', tags: ['志愿者'], dataSource: 'manual', status: true, createTime: '2024-01-15 10:00:00', updateTime: '2024-01-15 10:00:00' },
  { id: 3, projectId: 20, name: '王伟', phone: '13800138003', idCard: '110101199003033456', gender: 'male', birthday: '1990-03-03', nationality: '汉族', nativePlace: '浙江温州', education: '大专', profession: '个体经营', tags: [], dataSource: 'manual', status: true, createTime: '2024-02-01 10:00:00', updateTime: '2024-02-01 10:00:00' },
  { id: 4, projectId: 20, name: '赵敏', phone: '13800138004', idCard: '110101198812124567', gender: 'female', birthday: '1988-12-12', nationality: '汉族', nativePlace: '浙江绍兴', education: '本科', profession: '公务员', tags: ['党员'], dataSource: 'manual', status: true, createTime: '2024-02-01 10:00:00', updateTime: '2024-02-01 10:00:00' },
  { id: 5, projectId: 20, name: '陈强', phone: '13800138005', idCard: '110101197507075678', gender: 'male', birthday: '1975-07-07', nationality: '汉族', nativePlace: '浙江嘉兴', education: '高中', profession: '退休', tags: ['高龄', '业委会成员'], dataSource: 'manual', status: true, createTime: '2024-02-15 10:00:00', updateTime: '2024-02-15 10:00:00' },
  { id: 6, projectId: 20, name: '刘洋', phone: '13800138006', idCard: '110101199508086789', gender: 'male', birthday: '1995-08-08', nationality: '汉族', nativePlace: '浙江湖州', education: '本科', profession: '程序员', tags: ['志愿者'], dataSource: 'owner_register', status: true, createTime: '2024-03-01 10:00:00', updateTime: '2024-03-01 10:00:00' },
  { id: 7, projectId: 20, name: '周丽', phone: '13800138007', idCard: '110101199211119012', gender: 'female', birthday: '1992-11-11', nationality: '汉族', nativePlace: '浙江金华', education: '硕士', profession: '设计师', tags: [], dataSource: 'owner_register', status: true, createTime: '2024-03-01 10:00:00', updateTime: '2024-03-01 10:00:00' },
  { id: 8, projectId: 21, name: '吴建国', phone: '13900139001', idCard: '110101198203031234', gender: 'male', birthday: '1982-03-03', nationality: '汉族', nativePlace: '浙江杭州', education: '本科', profession: '工程师', tags: ['业委会成员'], dataSource: 'gov_sync', status: true, createTime: '2024-01-10 10:00:00', updateTime: '2024-01-10 10:00:00' },
  { id: 9, projectId: 21, name: '郑秀英', phone: '13900139002', idCard: '110101198707074567', gender: 'female', birthday: '1987-07-07', nationality: '汉族', nativePlace: '浙江杭州', education: '大专', profession: '会计', tags: [], dataSource: 'gov_sync', status: true, createTime: '2024-01-10 10:00:00', updateTime: '2024-01-10 10:00:00' },
  { id: 10, projectId: 22, name: '孙浩然', phone: '13700137001', idCard: '110101199001015678', gender: 'male', birthday: '1990-01-01', nationality: '汉族', nativePlace: '浙江杭州', education: '本科', profession: '销售经理', tags: [], dataSource: 'manual', status: true, createTime: '2024-04-01 10:00:00', updateTime: '2024-04-01 10:00:00' },
];

// ===== Mock 业主-房屋绑定关系 =====
let mockHouseOwners: HouseOwner[] = [
  { id: 1, houseId: 1, ownerId: 1, ownerType: 'owner', bindTime: '2024-01-20 10:00:00', isActive: true, createTime: '2024-01-20 10:00:00', houseFullName: '1栋1单元0101', ownerName: '张建国', ownerPhone: '13800138001' },
  { id: 2, houseId: 2, ownerId: 2, ownerType: 'owner', bindTime: '2024-01-20 10:00:00', isActive: true, createTime: '2024-01-20 10:00:00', houseFullName: '1栋1单元0102', ownerName: '李秀芳', ownerPhone: '13800138002' },
  { id: 3, houseId: 3, ownerId: 3, ownerType: 'owner', bindTime: '2024-02-05 10:00:00', isActive: true, createTime: '2024-02-05 10:00:00', houseFullName: '1栋1单元0201', ownerName: '王伟', ownerPhone: '13800138003' },
  { id: 4, houseId: 4, ownerId: 4, ownerType: 'owner', bindTime: '2024-02-05 10:00:00', isActive: true, createTime: '2024-02-05 10:00:00', houseFullName: '1栋1单元0202', ownerName: '赵敏', ownerPhone: '13800138004' },
  { id: 5, houseId: 5, ownerId: 5, ownerType: 'owner', bindTime: '2024-02-20 10:00:00', isActive: true, createTime: '2024-02-20 10:00:00', houseFullName: '1栋1单元0301', ownerName: '陈强', ownerPhone: '13800138005' },
  { id: 6, houseId: 6, ownerId: 6, ownerType: 'owner', bindTime: '2024-03-05 10:00:00', isActive: true, createTime: '2024-03-05 10:00:00', houseFullName: '1栋1单元0302', ownerName: '刘洋', ownerPhone: '13800138006' },
  { id: 7, houseId: 7, ownerId: 7, ownerType: 'owner', bindTime: '2024-03-05 10:00:00', isActive: true, createTime: '2024-03-05 10:00:00', houseFullName: '1栋1单元0401', ownerName: '周丽', ownerPhone: '13800138007' },
  { id: 8, houseId: 1, ownerId: 2, ownerType: 'family', bindTime: '2024-01-20 10:00:00', isActive: true, remark: '配偶', createTime: '2024-01-20 10:00:00', houseFullName: '1栋1单元0101', ownerName: '李秀芳', ownerPhone: '13800138002' },
  { id: 9, houseId: 100, ownerId: 8, ownerType: 'owner', bindTime: '2024-01-15 10:00:00', isActive: true, createTime: '2024-01-15 10:00:00', houseFullName: 'A栋1单元0101', ownerName: '吴建国', ownerPhone: '13900139001' },
  { id: 10, houseId: 101, ownerId: 9, ownerType: 'owner', bindTime: '2024-01-15 10:00:00', isActive: true, createTime: '2024-01-15 10:00:00', houseFullName: 'A栋1单元0102', ownerName: '郑秀英', ownerPhone: '13900139002' },
];

// ===== Mock 业主变更记录 =====
let mockOwnerChangeLogs: OwnerChangeLog[] = [
  { id: 1, houseId: 1, oldOwnerId: undefined, newOwnerId: 1, changeType: 'other', changeReason: '初始绑定', operatorId: 1, changeTime: '2024-01-20 10:00:00', houseFullName: '1栋1单元0101', newOwnerName: '张建国', operatorName: '管理员' },
  { id: 2, houseId: 2, oldOwnerId: undefined, newOwnerId: 2, changeType: 'other', changeReason: '初始绑定', operatorId: 1, changeTime: '2024-01-20 10:00:00', houseFullName: '1栋1单元0102', newOwnerName: '李秀芳', operatorName: '管理员' },
];

// ===== Mock 车位数据 =====
let mockParkingSpaces: ParkingSpace[] = [
  { id: 1, projectId: 20, code: 'B1-001', type: 'fixed', floor: -1, sizeArea: 12.5, status: 'occupied', propertyType: 'sale', ownerId: 1, dataSource: 'manual', sortOrder: 1, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00', ownerName: '张建国' },
  { id: 2, projectId: 20, code: 'B1-002', type: 'fixed', floor: -1, sizeArea: 12.5, status: 'occupied', propertyType: 'sale', ownerId: 2, dataSource: 'manual', sortOrder: 2, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00', ownerName: '李秀芳' },
  { id: 3, projectId: 20, code: 'B1-003', type: 'fixed', floor: -1, sizeArea: 15.0, status: 'vacant', propertyType: 'sale', dataSource: 'manual', sortOrder: 3, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 4, projectId: 20, code: 'B1-005', type: 'fixed', floor: -1, sizeArea: 12.5, status: 'vacant', propertyType: 'rent', monthlyRent: 300, dataSource: 'manual', sortOrder: 4, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 5, projectId: 20, code: 'B1-006', type: 'temporary', floor: -1, sizeArea: 10.0, status: 'vacant', propertyType: 'public', dataSource: 'manual', sortOrder: 5, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 6, projectId: 20, code: 'B1-007', type: 'temporary', floor: -1, sizeArea: 10.0, status: 'occupied', propertyType: 'public', dataSource: 'manual', sortOrder: 6, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 7, projectId: 20, code: 'B1-008', type: 'mechanical', floor: -1, sizeArea: 8.0, status: 'vacant', propertyType: 'sale', dataSource: 'manual', sortOrder: 7, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 8, projectId: 20, code: 'B1-009', type: 'mechanical', floor: -1, sizeArea: 8.0, status: 'maintenance', propertyType: 'sale', dataSource: 'manual', sortOrder: 8, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 9, projectId: 20, code: 'B1-010', type: 'mother_child', floor: -1, sizeArea: 18.0, status: 'vacant', propertyType: 'sale', dataSource: 'manual', sortOrder: 9, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00' },
  { id: 10, projectId: 21, code: 'B1-001', type: 'fixed', floor: -1, sizeArea: 12.5, status: 'occupied', propertyType: 'sale', ownerId: 8, dataSource: 'gov_sync', sortOrder: 1, enabled: true, createTime: '2024-01-01 08:00:00', updateTime: '2024-01-01 08:00:00', ownerName: '吴建国' },
];

// ===== 自增ID计数器 =====
let nextBuildingId = 13;
let nextUnitId = 16;
let nextHouseId = mockHouses.length + 1;
let nextOwnerId = 11;
let nextHouseOwnerId = 11;
let nextChangeLogId = 3;
let nextParkingId = 11;
let nextAccountId = 4;
let nextTxId = 6;

// ===== Mock 业主账户数据 =====
let mockAccounts: OwnerAccount[] = [
  { id: 1, projectId: 20, ownerId: 1, ownerName: '张建国', ownerPhone: '13800138001', balance: 50000, totalRecharge: 100000, totalPayment: 50000, freezeAmount: 0, status: true, createTime: '2026-01-01 00:00:00', updateTime: '2026-04-01 10:00:00' },
  { id: 2, projectId: 20, ownerId: 2, ownerName: '李秀芳', ownerPhone: '13800138002', balance: 20000, totalRecharge: 50000, totalPayment: 30000, freezeAmount: 0, status: true, createTime: '2026-01-15 09:00:00', updateTime: '2026-03-20 14:00:00' },
  { id: 3, projectId: 21, ownerId: 8, ownerName: '吴建国', ownerPhone: '13900139001', balance: 0, totalRecharge: 0, totalPayment: 0, freezeAmount: 0, status: true, createTime: '2026-02-01 08:00:00', updateTime: '2026-02-01 08:00:00' },
];

// ===== Mock 交易记录 =====
let mockTransactions: AccountTransaction[] = [
  { id: 1, accountId: 1, ownerId: 1, projectId: 20, transactionType: 'recharge', amount: 100000, balanceBefore: 0, balanceAfter: 100000, status: 'success', remark: '前台现金充值', operatorName: '系统管理员', createTime: '2026-03-01 10:00:00' },
  { id: 2, accountId: 1, ownerId: 1, projectId: 20, transactionType: 'payment', amount: -30000, balanceBefore: 100000, balanceAfter: 70000, status: 'success', remark: '缴纳物业费-2026年第一季度', relatedBillId: 1, operatorName: '系统管理员', createTime: '2026-03-15 09:00:00' },
  { id: 3, accountId: 1, ownerId: 1, projectId: 20, transactionType: 'payment', amount: -20000, balanceBefore: 70000, balanceAfter: 50000, status: 'success', remark: '缴纳停车费-2026年3月', relatedBillId: 2, operatorName: '系统管理员', createTime: '2026-03-15 09:00:00' },
  { id: 4, accountId: 2, ownerId: 2, projectId: 20, transactionType: 'recharge', amount: 50000, balanceBefore: 0, balanceAfter: 50000, status: 'success', remark: '线上充值', operatorName: '李秀芳', createTime: '2026-03-20 14:00:00' },
  { id: 5, accountId: 2, ownerId: 2, projectId: 20, transactionType: 'payment', amount: -30000, balanceBefore: 50000, balanceAfter: 20000, status: 'success', remark: '缴纳物业费-2026年第一季度', relatedBillId: 3, operatorName: '系统管理员', createTime: '2026-03-20 14:30:00' },
];

// ====================================================================
// 楼栋 API
// ====================================================================

export async function getBuildings(projectId: number): Promise<Building[]> {
  await delay();
  return mockBuildings.filter(b => b.projectId === projectId && b.enabled);
}

export async function getBuildingById(id: number): Promise<Building | null> {
  await delay();
  return mockBuildings.find(b => b.id === id) || null;
}

export async function createBuilding(data: Omit<Building, 'id' | 'createTime' | 'updateTime'>): Promise<Building> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newBuilding: Building = {
    ...data,
    id: nextBuildingId++,
    createTime: now,
    updateTime: now,
  };
  mockBuildings.push(newBuilding);
  return newBuilding;
}

export async function updateBuilding(id: number, data: Partial<Building>): Promise<Building | null> {
  await delay();
  const index = mockBuildings.findIndex(b => b.id === id);
  if (index === -1) return null;
  mockBuildings[index] = {
    ...mockBuildings[index],
    ...data,
    id,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockBuildings[index];
}

export async function deleteBuilding(id: number): Promise<boolean> {
  await delay();
  const index = mockBuildings.findIndex(b => b.id === id);
  if (index === -1) return false;
  // 软删除
  mockBuildings[index].enabled = false;
  mockBuildings[index].updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

// ====================================================================
// 单元 API
// ====================================================================

export async function getUnits(buildingId?: number): Promise<BuildingUnit[]> {
  await delay();
  if (buildingId) return mockUnits.filter(u => u.buildingId === buildingId);
  return mockUnits;
}

export async function createUnit(data: Omit<BuildingUnit, 'id' | 'createTime' | 'updateTime'>): Promise<BuildingUnit> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newUnit: BuildingUnit = {
    ...data,
    id: nextUnitId++,
    createTime: now,
    updateTime: now,
  };
  mockUnits.push(newUnit);
  return newUnit;
}

export async function updateUnit(id: number, data: Partial<BuildingUnit>): Promise<BuildingUnit | null> {
  await delay();
  const index = mockUnits.findIndex(u => u.id === id);
  if (index === -1) return null;
  mockUnits[index] = {
    ...mockUnits[index],
    ...data,
    id,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockUnits[index];
}

export async function deleteUnit(id: number): Promise<boolean> {
  await delay();
  const index = mockUnits.findIndex(u => u.id === id);
  if (index === -1) return false;
  mockUnits.splice(index, 1);
  return true;
}

// ====================================================================
// 房屋 API
// ====================================================================

export interface HouseQueryParams {
  projectId: number;
  buildingId?: number;
  unitId?: number;
  floor?: number;
  ownershipStatus?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getHouses(params: HouseQueryParams): Promise<PaginatedResult<House>> {
  await delay();
  let filtered = mockHouses.filter(h => h.projectId === params.projectId && h.enabled);

  if (params.buildingId) {
    filtered = filtered.filter(h => h.buildingId === params.buildingId);
  }

  if (params.unitId) {
    filtered = filtered.filter(h => h.unitId === params.unitId);
  }

  if (params.floor) {
    filtered = filtered.filter(h => h.floor === params.floor);
  }

  if (params.ownershipStatus) {
    filtered = filtered.filter(h => h.ownershipStatus === params.ownershipStatus);
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(h =>
      h.fullName.toLowerCase().includes(kw) ||
      h.roomNo.toLowerCase().includes(kw) ||
      (h.buildingName && h.buildingName.toLowerCase().includes(kw))
    );
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total, page, pageSize };
}

export async function getHouseById(id: number): Promise<House | null> {
  await delay();
  return mockHouses.find(h => h.id === id) || null;
}

export async function createHouse(data: Omit<House, 'id' | 'createTime' | 'updateTime'>): Promise<House> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newHouse: House = {
    ...data,
    id: nextHouseId++,
    createTime: now,
    updateTime: now,
  };
  mockHouses.push(newHouse);
  return newHouse;
}

export async function updateHouse(id: number, data: Partial<House>): Promise<House | null> {
  await delay();
  const index = mockHouses.findIndex(h => h.id === id);
  if (index === -1) return null;
  mockHouses[index] = {
    ...mockHouses[index],
    ...data,
    id,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockHouses[index];
}

export async function deleteHouse(id: number): Promise<boolean> {
  await delay();
  const index = mockHouses.findIndex(h => h.id === id);
  if (index === -1) return false;
  mockHouses[index].enabled = false;
  mockHouses[index].updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

export interface BatchGenerateParams {
  projectId: number;
  buildingId: number;
  unitId: number;
  startFloor: number;
  endFloor: number;
  roomsPerFloor: number;
  roomPrefix?: string;
}

export async function batchGenerateHouses(params: BatchGenerateParams): Promise<House[]> {
  await delay(500);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const building = mockBuildings.find(b => b.id === params.buildingId);
  const unit = mockUnits.find(u => u.id === params.unitId);
  const newHouses: House[] = [];
  const roomSuffixes = ['01', '02', '03', '04', '05', '06'];

  for (let floor = params.startFloor; floor <= params.endFloor; floor++) {
    for (let r = 0; r < params.roomsPerFloor; r++) {
      const roomNo = `${String(floor).padStart(2, '0')}${roomSuffixes[r]}`;
      const fullName = `${building?.name || ''}${unit?.name || ''}${roomNo}`;
      newHouses.push({
        id: nextHouseId++,
        projectId: params.projectId,
        buildingId: params.buildingId,
        unitId: params.unitId,
        floor,
        roomNo,
        fullName,
        layout: '3室2厅',
        area: 90,
        usableArea: 72,
        orientation: '南',
        decorationStatus: 'rough',
        ownershipStatus: 'vacant',
        propertyType: building?.propertyType || 'residence',
        dataSource: 'manual',
        sortOrder: 1,
        enabled: true,
        createTime: now,
        updateTime: now,
        buildingName: building?.name || '',
        unitName: unit?.name || '',
      });
    }
  }
  mockHouses.push(...newHouses);
  return newHouses;
}

// ====================================================================
// 业主 API
// ====================================================================

export interface OwnerQueryParams {
  projectId: number;
  keyword?: string;
  tag?: string;
  dataSource?: DataSource;
  status?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getOwners(params: OwnerQueryParams): Promise<PaginatedResult<Owner>> {
  await delay();
  let filtered = mockOwners.filter(o => o.projectId === params.projectId);

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(o =>
      o.name.toLowerCase().includes(kw) ||
      o.phone.includes(kw) ||
      (o.idCard && o.idCard.includes(kw))
    );
  }

  if (params.tag) {
    filtered = filtered.filter(o => o.tags.includes(params.tag!));
  }

  if (params.dataSource) {
    filtered = filtered.filter(o => o.dataSource === params.dataSource);
  }

  if (params.status !== undefined) {
    filtered = filtered.filter(o => o.status === params.status);
  }

  // 补充统计信息
  const result = filtered.map(o => ({
    ...o,
    houseCount: mockHouseOwners.filter(h => h.ownerId === o.id && h.isActive).length,
    parkingCount: mockParkingSpaces.filter(p => p.ownerId === o.id).length,
  }));

  const total = result.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const list = result.slice(start, start + pageSize);

  return { list, total, page, pageSize };
}

export async function getOwnerById(id: number): Promise<Owner | null> {
  await delay();
  const owner = mockOwners.find(o => o.id === id);
  if (!owner) return null;
  return {
    ...owner,
    houseCount: mockHouseOwners.filter(h => h.ownerId === id && h.isActive).length,
    parkingCount: mockParkingSpaces.filter(p => p.ownerId === id).length,
  };
}

export async function createOwner(data: Omit<Owner, 'id' | 'createTime' | 'updateTime'>): Promise<Owner> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newOwner: Owner = {
    ...data,
    id: nextOwnerId++,
    createTime: now,
    updateTime: now,
  };
  mockOwners.push(newOwner);

  // 自动为该业主创建业主账户
  const newAccount: OwnerAccount = {
    id: nextAccountId++,
    projectId: newOwner.projectId,
    ownerId: newOwner.id,
    ownerName: newOwner.name,
    ownerPhone: newOwner.phone,
    balance: 0,
    totalRecharge: 0,
    totalPayment: 0,
    freezeAmount: 0,
    status: true,
    createTime: now,
    updateTime: now,
  };
  mockAccounts.push(newAccount);

  return newOwner;
}

export async function updateOwner(id: number, data: Partial<Owner>): Promise<Owner | null> {
  await delay();
  const index = mockOwners.findIndex(o => o.id === id);
  if (index === -1) return null;
  mockOwners[index] = {
    ...mockOwners[index],
    ...data,
    id,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockOwners[index];
}

export async function deleteOwner(id: number): Promise<boolean> {
  await delay();
  const index = mockOwners.findIndex(o => o.id === id);
  if (index === -1) return false;
  mockOwners[index].status = false;
  mockOwners[index].updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

// ====================================================================
// 业主-房屋绑定 API
// ====================================================================

export async function getHouseOwners(houseId: number): Promise<HouseOwner[]> {
  await delay();
  return mockHouseOwners.filter(ho => ho.houseId === houseId && ho.isActive);
}

export async function bindOwner(data: {
  houseId: number;
  ownerId: number;
  ownerType: OwnerType;
  remark?: string;
}): Promise<HouseOwner> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const house = mockHouses.find(h => h.id === data.houseId);
  const owner = mockOwners.find(o => o.id === data.ownerId);
  const newBinding: HouseOwner = {
    id: nextHouseOwnerId++,
    houseId: data.houseId,
    ownerId: data.ownerId,
    ownerType: data.ownerType,
    bindTime: now,
    isActive: true,
    remark: data.remark,
    createTime: now,
    houseFullName: house?.fullName,
    ownerName: owner?.name,
    ownerPhone: owner?.phone,
  };
  mockHouseOwners.push(newBinding);

  // 记录变更日志
  mockOwnerChangeLogs.push({
    id: nextChangeLogId++,
    houseId: data.houseId,
    newOwnerId: data.ownerId,
    changeType: 'other',
    changeReason: '业主绑定',
    operatorId: 1,
    changeTime: now,
    houseFullName: house?.fullName,
    newOwnerName: owner?.name,
    operatorName: '管理员',
  });

  return newBinding;
}

export async function unbindOwner(id: number): Promise<boolean> {
  await delay();
  const index = mockHouseOwners.findIndex(ho => ho.id === id);
  if (index === -1) return false;
  mockHouseOwners[index].isActive = false;
  mockHouseOwners[index].unbindTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

export async function getOwnerChangeHistory(houseId?: number): Promise<OwnerChangeLog[]> {
  await delay();
  if (houseId) return mockOwnerChangeLogs.filter(log => log.houseId === houseId);
  return mockOwnerChangeLogs;
}

// ====================================================================
// 车位 API
// ====================================================================

export interface ParkingQueryParams {
  projectId: number;
  type?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function getParkingSpaces(params: ParkingQueryParams): Promise<PaginatedResult<ParkingSpace>> {
  await delay();
  let filtered = mockParkingSpaces.filter(p => p.projectId === params.projectId && p.enabled);

  if (params.type) {
    filtered = filtered.filter(p => p.type === params.type);
  }

  if (params.status) {
    filtered = filtered.filter(p => p.status === params.status);
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(p =>
      p.code.toLowerCase().includes(kw) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(kw))
    );
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return { list, total, page, pageSize };
}

export async function getParkingSpaceById(id: number): Promise<ParkingSpace | null> {
  await delay();
  return mockParkingSpaces.find(p => p.id === id) || null;
}

export async function createParkingSpace(data: Omit<ParkingSpace, 'id' | 'createTime' | 'updateTime'>): Promise<ParkingSpace> {
  await delay();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newSpace: ParkingSpace = {
    ...data,
    id: nextParkingId++,
    createTime: now,
    updateTime: now,
  };
  mockParkingSpaces.push(newSpace);
  return newSpace;
}

export async function updateParkingSpace(id: number, data: Partial<ParkingSpace>): Promise<ParkingSpace | null> {
  await delay();
  const index = mockParkingSpaces.findIndex(p => p.id === id);
  if (index === -1) return null;
  mockParkingSpaces[index] = {
    ...mockParkingSpaces[index],
    ...data,
    id,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockParkingSpaces[index];
}

export async function deleteParkingSpace(id: number): Promise<boolean> {
  await delay();
  const index = mockParkingSpaces.findIndex(p => p.id === id);
  if (index === -1) return false;
  mockParkingSpaces[index].enabled = false;
  mockParkingSpaces[index].updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return true;
}

export async function bindParkingOwner(parkingId: number, ownerId: number): Promise<ParkingSpace | null> {
  await delay();
  const pIndex = mockParkingSpaces.findIndex(p => p.id === parkingId);
  if (pIndex === -1) return null;
  const owner = mockOwners.find(o => o.id === ownerId);
  mockParkingSpaces[pIndex] = {
    ...mockParkingSpaces[pIndex],
    ownerId,
    status: 'occupied',
    ownerName: owner?.name,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockParkingSpaces[pIndex];
}

export async function unbindParkingOwner(parkingId: number): Promise<ParkingSpace | null> {
  await delay();
  const pIndex = mockParkingSpaces.findIndex(p => p.id === parkingId);
  if (pIndex === -1) return null;
  mockParkingSpaces[pIndex] = {
    ...mockParkingSpaces[pIndex],
    ownerId: undefined,
    status: 'vacant',
    ownerName: undefined,
    updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  return mockParkingSpaces[pIndex];
}

// ====================================================================
// 统计 API
// ====================================================================

export async function getAssetStatistics(projectId: number): Promise<AssetStatistics> {
  await delay();
  const buildings = mockBuildings.filter(b => b.projectId === projectId && b.enabled);
  const houses = mockHouses.filter(h => h.projectId === projectId && h.enabled);
  const parkings = mockParkingSpaces.filter(p => p.projectId === projectId && p.enabled);
  const owners = mockOwners.filter(o => o.projectId === projectId && o.status);

  const occupiedCount = houses.filter(h => h.ownershipStatus === 'occupied').length;
  const vacantCount = houses.filter(h => h.ownershipStatus === 'vacant').length;
  const boundHouseIds = new Set(mockHouseOwners.filter(ho => ho.isActive).map(ho => ho.houseId));
  const boundHouseCount = houses.filter(h => boundHouseIds.has(h.id)).length;

  const projectName = '桂花城'; // 简化处理

  return {
    projectId,
    projectName,
    buildingCount: buildings.length,
    houseCount: houses.length,
    occupiedCount,
    vacantCount,
    occupancyRate: houses.length > 0 ? Math.round((occupiedCount / houses.length) * 10000) / 100 : 0,
    parkingCount: parkings.length,
    fixedParkingCount: parkings.filter(p => p.type === 'fixed').length,
    temporaryParkingCount: parkings.filter(p => p.type === 'temporary').length,
    soldRentedParkingCount: parkings.filter(p => p.status === 'occupied').length,
    parkingUtilizationRate: parkings.length > 0 ? Math.round((parkings.filter(p => p.status === 'occupied').length / parkings.length) * 10000) / 100 : 0,
    ownerCount: owners.length,
    boundHouseCount,
    unboundHouseCount: houses.length - boundHouseCount,
    monthlyNewOwnerCount: 3,
    dataSource: 'manual',
  };
}

export async function getBuildingStatistics(projectId: number): Promise<BuildingStatistics[]> {
  await delay();
  const buildings = mockBuildings.filter(b => b.projectId === projectId && b.enabled);
  return buildings.map(b => {
    const houses = mockHouses.filter(h => h.buildingId === b.id && h.enabled);
    const occupiedCount = houses.filter(h => h.ownershipStatus === 'occupied').length;
    return {
      buildingId: b.id,
      buildingName: b.name,
      totalHouses: houses.length,
      occupiedCount,
      occupancyRate: houses.length > 0 ? Math.round((occupiedCount / houses.length) * 10000) / 100 : 0,
    };
  });
}

// ====================================================================
// 数据同步 API
// ====================================================================

export interface SyncLog {
  id: number;
  projectId: number;
  syncType: 'building' | 'house' | 'owner' | 'parking';
  syncStatus: 'success' | 'partial' | 'failed';
  totalCount: number;
  successCount: number;
  failCount: number;
  errorMessage?: string;
  syncTime: string;
  operatorName?: string;
}

let mockSyncLogs: SyncLog[] = [
  { id: 1, projectId: 21, syncType: 'building', syncStatus: 'success', totalCount: 3, successCount: 3, failCount: 0, syncTime: '2024-01-10 08:00:00', operatorName: '系统' },
  { id: 2, projectId: 21, syncType: 'house', syncStatus: 'success', totalCount: 72, successCount: 72, failCount: 0, syncTime: '2024-01-10 08:05:00', operatorName: '系统' },
  { id: 3, projectId: 21, syncType: 'owner', syncStatus: 'partial', totalCount: 5, successCount: 4, failCount: 1, errorMessage: '1条数据身份证号格式异常', syncTime: '2024-01-10 08:10:00', operatorName: '系统' },
  { id: 4, projectId: 21, syncType: 'parking', syncStatus: 'success', totalCount: 1, successCount: 1, failCount: 0, syncTime: '2024-01-10 08:15:00', operatorName: '系统' },
];

let nextSyncLogId = 5;

export async function getSyncLogs(projectId: number): Promise<SyncLog[]> {
  await delay();
  return mockSyncLogs.filter(log => log.projectId === projectId);
}

export async function triggerSync(projectId: number, syncTypes: string[]): Promise<SyncLog[]> {
  await delay(1000);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const results: SyncLog[] = [];

  for (const type of syncTypes) {
    const totalCount = type === 'building' ? 3 : type === 'house' ? 72 : type === 'owner' ? 5 : 2;
    const successCount = Math.floor(totalCount * 0.95);
    const failCount = totalCount - successCount;
    const log: SyncLog = {
      id: nextSyncLogId++,
      projectId,
      syncType: type as any,
      syncStatus: failCount > 0 ? 'partial' : 'success',
      totalCount,
      successCount,
      failCount,
      errorMessage: failCount > 0 ? `${failCount}条数据同步失败` : undefined,
      syncTime: now,
      operatorName: '管理员',
    };
    results.push(log);
    mockSyncLogs.push(log);
  }

  return results;
}

// ====================================================================
// 标签 API（业主标签管理）
// ====================================================================

// ====================================================================
// 业主账户 API
// ====================================================================

export async function getOwnerAccounts(projectId: number): Promise<OwnerAccount[]> {
  await delay();
  return mockAccounts.filter(a => a.projectId === projectId);
}

export async function getOwnerAccountByOwnerId(ownerId: number): Promise<OwnerAccount | null> {
  await delay();
  return mockAccounts.find(a => a.ownerId === ownerId) || null;
}

export async function rechargeOwnerAccount(
  accountId: number,
  amount: number,
  remark?: string
): Promise<OwnerAccount | null> {
  await delay();
  const index = mockAccounts.findIndex(a => a.id === accountId);
  if (index === -1) return null;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const account = mockAccounts[index];
  mockAccounts[index] = {
    ...account,
    balance: account.balance + amount,
    totalRecharge: account.totalRecharge + amount,
    updateTime: now,
  };
  // 添加交易记录
  const newTx: AccountTransaction = {
    id: nextTxId++,
    accountId: account.id,
    ownerId: account.ownerId,
    projectId: account.projectId,
    transactionType: 'recharge',
    amount,
    balanceBefore: account.balance,
    balanceAfter: account.balance + amount,
    status: 'success',
    remark: remark || '前台充值',
    operatorName: '系统管理员',
    createTime: now,
  };
  mockTransactions.push(newTx);
  return mockAccounts[index];
}

export async function getAccountTransactions(accountId: number): Promise<AccountTransaction[]> {
  await delay();
  return mockTransactions.filter(t => t.accountId === accountId);
}

export async function getAllOwnerTags(projectId: number): Promise<string[]> {
  await delay();
  const tags = new Set<string>();
  mockOwners.filter(o => o.projectId === projectId).forEach(o => {
    o.tags.forEach(t => tags.add(t));
  });
  return Array.from(tags);
}