export interface ItemsPurchase {
  id: string;
  itemID: string;
  umid: string;
  warehouseID: string;
  vendorID: string;
  warrantyDays: number;
  underDelivery: number;
  overDelivery: number;
  importDuty: number;
  exciseTax: number;
  vatid: string;
}
