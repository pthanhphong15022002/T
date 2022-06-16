export class BS_Ranges{
    rangeID :String;
	rangeName : String;
    rangeName2 : String;
    rangeType : String;
    rangeUnit : String;
    rangeValue : Number;
    payItemID : String;
    note :String;
    expiredOn : Date;
    attachments :Number;
    comments :Number;
    stop :Boolean;
    createdOn :Date;
    createdBy :String;
    modifiedOn :Date;
    modifiedBy :String;
    owner :String;
    build :String;
    employeeID :String;
    positionID :String;
    orgUnitID :String;
    divisionID :String;
}

export class BS_RangeLines{
    RecID: String;
    RangeID: String;
    BreakName: String;
    BreakValue: Number;
    Color: String;    
}