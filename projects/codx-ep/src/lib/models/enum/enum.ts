export enum FuncID {
  //EP4
  Rooms = 'EP4S21',
  BookingRooms = 'EP4T11',
  ApproveRooms = 'EP4T21',

  //EP7
  Cars = 'EP7S21',
  Drivers = 'EP7S22',
  EpCards = 'EP7S23',
  BookingCars = 'EP7T11',
  ApproveCars = 'EP7T21',

  //EP8
  Stationery = 'EP8S21',
  BookingStationery = 'EP8T11',
  ApproveStationery = 'EP8T21',
}

export enum MFFuncID {
  //SYS
  Delete = 'SYS02',
  Edit = 'SYS03',
  Copy = 'SYS04',

  //EP4
  ApprovedRooms = 'EPT40101',
  RejectRooms = 'EPT40105',
  UndoRooms = 'EPT40106',
  UpdateDate = 'EP4T1101',
  InviteMembers = 'EP4T1102',
  //EP7
  ApprovedCars = 'EPT40201',
  RejectCars = 'EPT40205',
  UndoCars = 'EPT40206',
  //EP8
  ApprovedStationery = 'EPT40301',
  RejectStationery = 'EPT40305',
  UndoStationery = 'EPT40306',
  UpdateInventory = 'EPS2301',
  SettingCapacity = 'EPS2302'

}
