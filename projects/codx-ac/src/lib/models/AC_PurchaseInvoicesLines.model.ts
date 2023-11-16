import { Util } from "codx-core";

export class AC_PurchaseInvoicesLines {
  recID: string = Util.uid();

  transID: string;

  rowNo: number = 0;

  lineType: string = '1';

  lineStatus: string = '60';

  lotID: string = Util.uid();

  itemID: string;

  itemName: string;

  IDIMID: string = Util.uid();

  IDIM0: string;

  IDIM1: string;

  IDIM2: string;

  IDIM3: string;

  IDIM4: string;

  IDIM5: string;

  IDIM6: string;

  IDIM7: string;

  IDIM8: string;

  IDIM9: string;

  fixedDIMs: string = '0000000000';

  CWUM: string;

  cWConversion: number = 0;

  cWQty: number = 0;

  cWPrice: boolean;

  UMID: string;

  conversion: number = 0;

  quantity: number = 0;

  costPrice: number = 0;

  costAmt: number = 0;

  purcPrice: number = 0;

  purcAmt: number = 0;

  lineDiscPct: number = 0;

  lineDiscAmt: number = 0;

  totalDiscPct: number = 0;

  totalDiscAmt: number = 0;

  discPct: number = 0;

  discAmt: number = 0;

  netAmt: number = 0;

  miscPrice: number = 0;

  miscAmt: number = 0;

  salesTaxPct: number = 0;

  salesTaxAmt: number = 0;

  exciseTaxPct: number = 0;

  exciseTaxAmt: number = 0;

  VATID: string;

  vATBase: number = 0;

  vATPct: number = 0;

  vATAmt: number = 0;

  totalAmt: number = 0;

  purcAmt2: number = 0;

  discAmt2: number = 0;

  netAmt2: number = 0;

  miscAmt2: number = 0;

  salesTaxAmt2: number = 0;

  exciseTaxAmt2: number = 0;

  vATBase2: number = 0;

  vATAmt2: number = 0;

  totalAmt2: number = 0;

  vATBase3: number = 0;

  vATAmt3: number = 0;

  pmtTermID: string;

  DIM1: string;

  DIM2: string;

  DIM3: string;

  projectID: string;

  reasonID: string;

  consumption: boolean;

  assetType: string;

  assetGroupID: string;

  serviceDate: Date | string | null;

  servicePeriods: number = 0;

  employeeID: string;

  siteID: string;

  inventAcctID: string;

  aPAcctID: string;

  note: string;

  refType: string;

  refNo: string;

  refID: string | null;

  refLotID: string | null;

  refLineID: string | null;

  registeredQty: number = 0;

  deliveredQty: number = 0;

  cWRegisteredQty: number = 0;

  cWDeliveredQty: number = 0;

  autoCreated: boolean;

  createdOn: Date | string;

  createdBy: string;

  modifiedOn: Date | string | null;

  modifiedBy: string;
}
