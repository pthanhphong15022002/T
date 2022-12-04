export class TN_OrderModule {
  expiredOn: string;
  boughtModule: {
    ModuleID: string;
    ModuleName: string;
    ModuleType: string;
    Category: string;
    Description: string;
    RefID: string;
    ParentID: string;
    Image: string;
    Color: string;
    Quantity: string;
    Price: string;
    UMID: string;
  };
  bought: boolean;
}
