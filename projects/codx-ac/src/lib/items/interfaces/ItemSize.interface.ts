export interface ItemSize {
  id: string;
  recID: string;
  itemID: string;
  sizeID: string;
  sizeName: string;
  sizeName2: string;
  sizeType: string;
  umid: string;
  length: number;
  width: number;
  height: number;
  nWeight: number;
  gWeight: number;
  note: string;
  sorting: string;
  stop: boolean;
  createdOn: string;
  createdBy: string;
  modifiedOn: string | null;
  modifiedBy: string;
}
