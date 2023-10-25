import { Util } from "codx-core";

export class IV_VouchersLines {
    recID: string = Util.uid();

    rowNo: number = 0;

    transID: string;

    reasonID: string;

    lineType: string;

    lineStatus: string;

    barcode: string;

    itemID: string;

    itemName: string;

    lotID: string;

    IDIMID: string;

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

    UMID: string;

    conversion: number = 0;

    qty: number = 0;

    onhand: number = 0;

    stdCost: number = 0;

    costPrice: number = 0;

    costAmt: number = 0;

    inventAcctID: string;

    offsetAcctID: string;

    DIM1: string;

    DIM2: string;

    DIM3: string;

    projectID: string;

    assetType: string;

    assetGroupID: string;

    placeInService: boolean;

    serviceDate: Date | string | null;

    servicePeriods: number = 0;

    employeeID: string;

    siteID: string;

    prodStageID: string;

    WCID: string;

    note: string;

    refType: string;

    refNo: string;

    refID: string | null;

    refLotID: string | null;

    orderNo: string;

    alloRule: string;

    alloFactor: number = 0;

    reservation: string;

    reservedQty: number = 0;

    registeringQty: number = 0;

    registeredQty: number = 0;

    postedQty: number = 0;

    canceledQty: number = 0;

    cWReservedQty: number = 0;

    cWRegisteringQty: number = 0;

    cWRegisteredQty: number = 0;

    cWPostedQty: number = 0;

    cWCanceledQty: number = 0;

    autoCreated: boolean;

    createdOn: Date | string;

    createdBy: string;

    modifiedOn: Date | string | null;

    modifiedBy: string;
}