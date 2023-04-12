export interface UMConversion {
    recID: string;
    itemID: string;
    iDIM0: string;
    iDIM1: string;
    iDIM2: string;
    iDIM3: string;
    fromUMID: string;
    toUMID: string;
    conversion: any;
    inverted: any;
    note: string;
    createdOn: string;
    createdBy: string;
    modifiedOn: string | null;
    modifiedBy: string;
    owner: string;
    bUID: string;
    employeeID: string;
    positionID: string;
    orgUnitID: string;
    divisionID: string;
}