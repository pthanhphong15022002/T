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
  pwLength: number;
  pwLifeDays: number;
  pwExpireWarning: number;
  pwDuplicate: number;
  blockSystem: number;
  freezeInMinutes: number
}

export class SYS_FunctionList{
  functionID: string;
  functionType: string;
  defaultName: string;
  customName: string;
  description: string;
  parentID: string;
  module: string;
  smallIcon: string;
  createdBy: string;
}
