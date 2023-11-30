import { Util } from "codx-core";

export class IV_TransfersLines {
    recID: string = Util.uid();

    rowNo: number = 0;

    transID: string;

    lineType: string = '1';

    barcode: string;

    itemID: string;

    itemName: string;

    lotID1: string;

    IDIMID1: string = Util.uid();

    IDIM01: string;

    IDIM11: string;

    IDIM21: string;

    IDIM31: string;

    IDIM41: string;

    IDIM51: string;

    IDIM61: string;

    IDIM71: string;

    IDIM81: string;

    IDIM91: string;

    fixedDIMs1: string = '0000000000';

    alterItem: string;

    lotID2: string;

    IDIMID2: string = Util.uid();

    IDIM02: string;

    IDIM12: string;

    IDIM22: string;

    IDIM32: string;

    IDIM42: string;

    IDIM52: string;

    IDIM62: string;

    IDIM72: string;

    IDIM82: string;

    IDIM92: string;

    fixedDIMs2: string = '0000000000';

    CWUM: string;

    cWConversion: number = 0;

    cWQty: number = 0;

    UMID: string;

    conversion: number = 0;

    qty: number = 0;

    onhand: number = 0;

    unitPrice: number = 0;

    costAmt: number = 0;

    reasonID: string;

    inventAcctID: string;

    offsetAcctID: string;

    note: string;

    refType: string;

    refNo: string;

    refID: string | null;

    refLotID: string | null;

    issueStatus: string;

    receiptStatus: string;

    reservation: string;

    reservedQty: number = 0;

    pickingQty: number = 0;

    pickedQty: number = 0;

    deliveredQty: number = 0;

    registeringQty: number = 0;

    registeredQty: number = 0;

    receivedQty: number = 0;

    scrapQty: number = 0;

    postedQty: number = 0;

    canceledQty: number = 0;

    cWReservedQty: number = 0;

    cWPickingQty: number = 0;

    cWPickedQty: number = 0;

    cWDeliveredQty: number = 0;

    cWRegisteringQty: number = 0;

    cWRegisteredQty: number = 0;

    cWReceivedQty: number = 0;

    cWScrapQty: number = 0;

    cWPostedQty: number = 0;

    cWCanceledQty: number = 0;

    autoCreated: boolean | null;

    createdOn: Date | string;

    createdBy: string;

    modifiedOn: Date | string | null;

    modifiedBy: string;
}