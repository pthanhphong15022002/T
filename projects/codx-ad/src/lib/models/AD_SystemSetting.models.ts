export class AD_SystemSetting{
  language: string;
  dBaseCurr: number;
  dSourceCurr: number;
  dSalesPrice: number;
  dExchRate: number;
  dQuantity: number;
  dCatchWeight: number;
  dPercent2: number;
  dFactor2: number;
  pWLength: number;
  pWLifeDays: number;
  pWExpireWarning: number;
  pWDuplicate: number;
  blockSystem: number;
  freezeInMinutes: number
}

export class TabControl{
  name: 'Thông tin chung' | 'Chính sách bảo mật' | 'Cấu hình ứng dụng' |string;
  textDefault: string;
  isActive: boolean;
}
