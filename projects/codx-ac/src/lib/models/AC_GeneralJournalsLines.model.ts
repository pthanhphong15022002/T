import { Util } from 'codx-core';

export class AC_GeneralJournalsLines {

    recID: string = Util.uid();

    transID: string;

    rowNo: number = 0;

    reasonID: string;

    accountID: string;

    subLGType: string;

    objectType: string;

    objectID: string;

    settlement: string;

    settledID: string | null;

    settledNo: string;

    contractID: string;

    DR: number = 0;

    CR: number = 0;

    DR2: number = 0;

    CR2: number = 0;

    DIM1: string;

    DIM2: string;

    DIM3: string;

    projectID: string;

    offsetAcctID: string;

    isBrigdeAcct: boolean;

    VATID: string;

    vATAmt: number = 0;

    vATAmt2: number = 0;

    illegalAmt: number = 0;

    assetType: string;

    assetGroupID: string;

    placeInService: boolean;

    serviceDate: Date | string | null;

    servicePeriods: number = 0;

    employeeID: string;

    siteID: string;

    refType: string;

    refNo: string;

    refLineID: string | null;

    note: string;

    singleEntry: boolean | null;

    autoCreated: boolean;

    createdOn: Date | string;

    createdBy: string;

    modifiedOn: Date | string | null;

    modifiedBy: string;
}