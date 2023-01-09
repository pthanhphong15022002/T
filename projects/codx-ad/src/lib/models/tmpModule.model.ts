export class TN_OrderModule {
  expiredOn: string;
  boughtModule: {
    moduleID: string;
    moduleName: string;
    moduleType: string;
    category: string;
    description: string;
    refID: string;
    parentID: string;
    image: string;
    color: string;
    quantity: number;
    price: number;
    interval: string;
    uMID: string;
  };
  bought: boolean;
}
