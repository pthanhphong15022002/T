export class CM_Products {
  recID: string;
  productID: string;
  productType: string;
  productName: string;
  unitPrice: number;
  specifications: string;
  isCompanyProduct: boolean = false;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}

export class CM_Quotations {
  recID: string;
  quotationID: string;
  objectType: string;
  objectID: string;
  quotationName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifiedBy: string;
}
